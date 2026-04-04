"""Training Project Sync Service"""

from datetime import datetime, date
from typing import List, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.dsr_activity import DSRActivity, DSRActivityStatus
from app.models.dsr_project import DSRProject, DSRProjectType
from app.models.training_batch_plan import TrainingBatchPlan
from app.models.user import User
from app.repositories.dsr_activity_repository import DSRActivityRepository
from app.repositories.dsr_project_repository import DSRProjectRepository
from app.repositories.training_batch_plan_repository import TrainingBatchPlanRepository


class TrainingProjectSyncService:
    """
    Service to synchronize Training Batch Plans with DSR Activities.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.activity_repo = DSRActivityRepository(db)
        self.project_repo = DSRProjectRepository(db)
        self.plan_repo = TrainingBatchPlanRepository(db)

    async def sync_batch_to_projects(self, batch_id: int) -> None:
        """
        Find all DSR projects linked to this batch and sync their activities.
        Called whenever the batch lesson plan changes.
        """
        from app.models.dsr_project import dsr_project_batches
        from sqlalchemy import or_

        # Find all projects linked to this batch (Many-to-Many OR Legacy Single Link)
        # We need to join with association table
        query = (
            select(DSRProject)
            .outerjoin(dsr_project_batches, DSRProject.id == dsr_project_batches.c.project_id)
            .where(
                or_(
                    dsr_project_batches.c.batch_id == batch_id,
                    DSRProject.linked_batch_id == batch_id
                )
            )
            .where(DSRProject.project_type == DSRProjectType.TRAINING)
            .where(DSRProject.is_deleted == False)
        )
        
        result = await self.db.execute(query)
        projects = result.scalars().all()
        
        for project in projects:
            await self.sync_activities_for_project(project.id)

    async def sync_activities_for_project(self, project_id: int) -> None:
        """
        Synchronize activities for a specific training project based on its linked batch plan.
        """
        project = await self.project_repo.get_with_batches(project_id)
        if not project or project.project_type != DSRProjectType.TRAINING:
            return

        # 1. Load all plan entries for ALL linked batches
        batches = project.linked_batches
        plans = []
        for batch in batches:
            batch_plans = await self.plan_repo.get_all_by_batch_id(batch.id)
            plans.extend(batch_plans)
        
        # Legacy support for single batch link if any
        if project.linked_batch_id and not any(b.id == project.linked_batch_id for b in batches):
            legacy_plans = await self.plan_repo.get_all_by_batch_id(project.linked_batch_id)
            plans.extend(legacy_plans)
        # 2. Group by (activity_name, trainer_user_id)
        # key: (subject_name, trainer_id)
        # value: {estimated_hours: float, start_date: date, end_date: date, trainer_user: User}
        groups: Dict[Tuple[str, int], dict] = {}
        
        for plan in plans:
            # We only sync sessions that have a trainer assigned
            if not plan.trainer_user_id:
                continue
                
            # Calculate duration
            start_dt = datetime.combine(plan.date, plan.start_time)
            end_dt = datetime.combine(plan.date, plan.end_time)
            duration = (end_dt - start_dt).total_seconds() / 3600.0
            
            clean_name = plan.activity_name.strip()
            key = (clean_name, plan.trainer_user_id)
            
            if key not in groups:
                groups[key] = {
                    "name": clean_name,
                    "trainer_id": plan.trainer_user_id,
                    "estimated_hours": 0.0,
                    "start_date": plan.date,
                    "end_date": plan.date
                }
            
            groups[key]["estimated_hours"] += duration
            groups[key]["start_date"] = min(groups[key]["start_date"], plan.date)
            groups[key]["end_date"] = max(groups[key]["end_date"], plan.date)

        # 3. Load existing activities for this project
        existing_activities = await self.activity_repo.get_activities_for_project(project.id)
        
        # Map existing activities by (name, first_assigned_user_id) for matching
        # Note: In our sync, each activity is assigned to exactly one trainer from the plan
        activity_map: Dict[Tuple[str, int], DSRActivity] = {}
        for act in existing_activities:
            if act.assigned_users:
                # We expect one trainer per synced activity as per refined plan
                trainer_id = act.assigned_users[0].id
                activity_map[(act.name, trainer_id)] = act

        # 4. Sync: Update or Create
        seen_keys = set()
        for key, data in groups.items():
            seen_keys.add(key)
            
            if key in activity_map:
                # UPDATE
                act = activity_map[key]
                act.estimated_hours = round(data["estimated_hours"], 2)
                act.start_date = data["start_date"]
                act.end_date = data["end_date"]
                # Ensure trainer is assigned (should already be, but safe to check)
                if not any(u.id == data["trainer_id"] for u in act.assigned_users):
                    trainer = await self.db.get(User, data["trainer_id"])
                    if trainer:
                        act.assigned_users.append(trainer)
            else:
                # CREATE
                trainer = await self.db.get(User, data["trainer_id"])
                if not trainer:
                    continue
                    
                new_act = DSRActivity(
                    project_id=project.id,
                    name=data["name"],
                    description=f"Automated activity for {data['name']} (Trainer: {trainer.full_name or trainer.username})",
                    start_date=data["start_date"],
                    end_date=data["end_date"],
                    estimated_hours=round(data["estimated_hours"], 2),
                    status=DSRActivityStatus.PLANNED,
                    is_active=True,
                    assigned_users=[trainer]
                )
                self.db.add(new_act)

        # 5. REMOVE activities that are no longer in the plan
        # BUT only if they haven't been used in any DSR entries (to prevent data loss)
        for key, act in activity_map.items():
            if key not in seen_keys:
                # Check if it has actual hours logged
                if act.total_actual_hours == 0:
                    # Soft delete or hard delete based on repo preference. 
                    # BaseRepository.delete does soft delete by default if supported.
                    await self.activity_repo.delete(act.id)
                else:
                    # Keep it but maybe mark as inactive?
                    act.is_active = False

        await self.db.flush()
        await self.db.commit()
