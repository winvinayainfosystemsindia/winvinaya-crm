"""DSR Project Service"""

from typing import List, Optional, Tuple
from uuid import UUID
import io
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dsr_project import DSRProject
from app.models.user import User, UserRole
from app.schemas.dsr_project import DSRProjectCreate, DSRProjectUpdate, DSRProjectImportResult
from app.repositories.dsr_project_repository import DSRProjectRepository
from app.repositories.user_repository import UserRepository
from app.repositories.dsr_entry_repository import DSREntryRepository


def _require_manager_or_admin(current_user: User) -> None:
    if current_user.role not in (UserRole.ADMIN, UserRole.MANAGER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers or Admins can manage projects",
        )


def _require_admin(current_user: User) -> None:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins can perform this action",
        )


class DSRProjectService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DSRProjectRepository(db)
        self.user_repo = UserRepository(db)
        self.dsr_repo = DSREntryRepository(db)

    async def create_project(self, data: DSRProjectCreate, current_user: User) -> DSRProject:
        _require_manager_or_admin(current_user)
        # Resolve owner
        owner = await self.user_repo.get_by_fields(public_id=data.owner_user_public_id)
        if not owner:
            raise HTTPException(status_code=404, detail="Owner user not found")
        owner_user = owner[0] if owner else None
        if not owner_user:
            raise HTTPException(status_code=404, detail="Owner user not found")

        project_data = {
            "name": data.name,
            "owner_id": owner_user.id,
            "created_by": current_user.id,
            "is_active": data.is_active,
            "others": data.others,
        }
        return await self.repo.create(project_data)

    async def update_project(
        self, public_id: UUID, data: DSRProjectUpdate, current_user: User
    ) -> DSRProject:
        _require_manager_or_admin(current_user)
        project = await self._get_or_404(public_id)

        update_data: dict = data.model_dump(exclude_unset=True)

        if "owner_user_public_id" in update_data:
            owner_pid = update_data.pop("owner_user_public_id")
            owner = await self.user_repo.get_by_fields(public_id=owner_pid)
            if not owner:
                raise HTTPException(status_code=404, detail="New owner user not found")
            update_data["owner_id"] = owner[0].id

        updated = await self.repo.update(project.id, update_data)
        return await self._get_or_404(public_id)

    async def delete_project(self, public_id: UUID, current_user: User) -> bool:
        _require_admin(current_user)
        project = await self._get_or_404(public_id)
        
        # Check if project is used in any DSR entries
        usage_count = await self.dsr_repo.count_references(project_public_id=project.public_id)
        if usage_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Project '{project.name}' cannot be deleted because it is referenced in {usage_count} DSR entry/entries. Please deactivate it instead.",
            )
            
        return await self.repo.delete(project.id)

    async def get_projects(
        self,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = False,
        assigned_to_public_id: Optional[UUID] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[DSRProject], int]:
        assigned_to_id = None
        if assigned_to_public_id:
            user = await self.user_repo.get_by_fields(public_id=assigned_to_public_id)
            if user:
                assigned_to_id = user[0].id

        return await self.repo.get_multi_paginated(
            skip=skip, limit=limit, active_only=active_only, assigned_to=assigned_to_id, search=search
        )

    async def get_project(self, public_id: UUID) -> DSRProject:
        return await self._get_or_404(public_id)

    async def import_from_excel(
        self, file: UploadFile, current_user: User
    ) -> DSRProjectImportResult:
        """
        Bulk import projects from an Excel file.
        Expected columns: name, owner_email, is_active (optional), others (optional JSON)
        """
        _require_manager_or_admin(current_user)

        try:
            import openpyxl
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="openpyxl not installed. Add it to requirements.txt.",
            )

        content = await file.read()
        wb = openpyxl.load_workbook(io.BytesIO(content))
        ws = wb.active

        headers = [str(c.value).strip().lower() if c.value else "" for c in next(ws.iter_rows(min_row=1, max_row=1))]
        required = {"name", "owner_email"}
        missing_headers = required - set(headers)
        if missing_headers:
            raise HTTPException(
                status_code=422,
                detail=f"Excel missing required columns: {missing_headers}",
            )

        result = DSRProjectImportResult(total_rows=0, created=0, skipped=0, errors=[])

        for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            row_data = dict(zip(headers, row))
            result.total_rows += 1

            name = str(row_data.get("name", "")).strip()
            owner_email = str(row_data.get("owner_email", "")).strip()

            if not name or not owner_email:
                result.skipped += 1
                result.errors.append({"row": row_idx, "error": "Missing name or owner_email"})
                continue

            # Check duplicate
            existing = await self.repo.get_by_name(name)
            if existing:
                result.skipped += 1
                result.errors.append({"row": row_idx, "error": f"Project '{name}' already exists"})
                continue

            owner = await self.user_repo.get_by_email(owner_email)
            if not owner:
                result.skipped += 1
                result.errors.append({"row": row_idx, "error": f"User with email '{owner_email}' not found"})
                continue

            is_active_val = row_data.get("is_active")
            is_active = True if is_active_val is None else bool(is_active_val)

            await self.repo.create({
                "name": name,
                "owner_id": owner.id,
                "created_by": current_user.id,
                "is_active": is_active,
                "others": None,
            })
            result.created += 1

        return result

    async def get_import_template(self) -> io.BytesIO:
        """Generate a blank Excel template for project import."""
        try:
            import openpyxl
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="openpyxl not installed. Add it to requirements.txt.",
            )

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Project Import Template"

        headers = ["name", "owner_email", "is_active"]
        ws.append(headers)

        # Add a sample row
        ws.append([
            "Sample Project", 
            "admin@example.com", 
            "TRUE"
        ])

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        return output

    async def _get_or_404(self, public_id: UUID) -> DSRProject:
        project = await self.repo.get_by_public_id(public_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
