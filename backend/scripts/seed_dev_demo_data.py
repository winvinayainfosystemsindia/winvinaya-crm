"""
WinVinaya CRM - Dev Environment Demo Data Seeding Script
Location: backend/scripts/seed_dev_demo_data.py

Seeds comprehensive, realistic, and fully validated demo data across all CRM modules:
  1. Candidates (10 complete PwD candidate profiles with education, disability, and guardian details)
  2. Candidate Screening & Career Counseling (multi-tab distribution: Not Screened, In Progress, Completed, Rejected)
  3. Candidate Documents (Demo documents attached: Resume, Disability, 10th, 12th, Degree, PAN, Aadhar, Photo)
  4. Master Skills Table (All master skills marked as verified)
  5. Training Batches, Allocations, Weekly Plans for Current Week, Daily Attendance for Today & This Week, Mock Interviews
  6. CRM Companies, Contacts, Leads, Deals, Tasks, Activity Logs
  7. Placement Job Roles, Candidate Mappings, Interview Rounds, Offers, Notes
  8. DSR Projects, Activity Types, Activities, Activity User Assignments, Daily Timesheets, Company Holidays
  9. Support Tickets & Discussion Threads
"""

import asyncio
import sys
import os
import uuid
from datetime import date, datetime, timedelta, time

# Ensure Windows async event loop compatibility
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Setup paths and environment
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.append(BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, text

# Import models
from app.models.user import User
from app.models.skill import Skill
from app.models.candidate import Candidate
from app.models.candidate_document import CandidateDocument
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_counseling import CandidateCounseling
from app.models.training_batch import TrainingBatch
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.models.training_attendance import TrainingAttendance
from app.models.training_assignment import TrainingAssignment
from app.models.training_mock_interview import TrainingMockInterview
from app.models.training_batch_plan import TrainingBatchPlan
from app.models.company import Company, CompanySize, CompanyStatus
from app.models.contact import Contact, ContactSource
from app.models.lead import Lead, LeadSource, LeadStatus
from app.models.deal import Deal, DealStage, DealType
from app.models.crm_task import CRMTask, CRMTaskType, CRMTaskPriority, CRMTaskStatus, CRMRelatedToType
from app.models.crm_activity_log import CRMActivityLog, CRMEntityType, CRMActivityType
from app.models.job_role import JobRole, JobRoleStatus
from app.models.placement_mapping import PlacementStatus, PlacementMapping
from app.models.placement_interview import PlacementInterview, InterviewRoundType, InterviewMode, InterviewResult
from app.models.placement_offer import PlacementOffer, OfferResponse, JoiningStatus
from app.models.placement_note import PlacementNote, NoteType
from app.models.dsr_project import DSRProject, DSRProjectType
from app.models.dsr_activity_type import DSRActivityType
from app.models.dsr_activity import DSRActivity, DSRActivityStatus, activity_assignments
from app.models.dsr_entry import DSREntry, DSRStatus
from app.models.company_holiday import CompanyHoliday
from app.models.ticket import Ticket, TicketMessage, TicketStatus, TicketPriority, TicketCategory

DB_URL = os.getenv(
    "DEV_DATABASE_URL",
    "postgresql+asyncpg://winvinaya_user:winvinaya12345@65.2.67.195:5432/winvinaya_dev?ssl=disable"
)


async def seed_dev_demo_data():
    print("=" * 75)
    print("WINVINAYA CRM - SEEDING ENRICHED DEMO DATA FOR ALL MODULES")
    print("=" * 75)

    engine = create_async_engine(DB_URL, connect_args={"ssl": False})
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with SessionLocal() as session:
        # Resolve existing users
        users_result = await session.execute(select(User).order_by(User.id))
        all_users = users_result.scalars().all()
        if not all_users:
            raise RuntimeError("No users found in database! Please ensure users exist before seeding.")

        admin_user = all_users[0]
        admin_id = admin_user.id
        print(f"Using default system user: ID {admin_id} ({admin_user.email})")

        # -------------------------------------------------------------
        # 1. VERIFY ALL SKILLS IN MASTER SKILLS TABLE
        # -------------------------------------------------------------
        print("\n[1/9] Verifying all skills in master skills table...")
        await session.execute(text("UPDATE skills SET is_verified = true;"))
        verified_count = (await session.execute(text("SELECT COUNT(*) FROM skills WHERE is_verified = true;"))).scalar()
        print(f"  -> Verified {verified_count} master skills.")

        # -------------------------------------------------------------
        # 2. CANDIDATES (10 Diverse PwD Profiles)
        # -------------------------------------------------------------
        print("\n[2/9] Seeding 10 Candidates...")
        candidates_raw = [
            {
                "name": "Rahul Verma",
                "gender": "male",
                "email": "rahul.verma@demo.winvinaya.com",
                "phone": "9876543210",
                "whatsapp_number": "9876543210",
                "dob": date(1998, 5, 14),
                "pincode": "560001",
                "city": "Bengaluru",
                "district": "Bengaluru Urban",
                "state": "Karnataka",
                "guardian_details": {"parent_name": "Ramesh Verma", "relationship": "Father", "parent_phone": "9876543211"},
                "work_experience": {"is_experienced": False, "currently_employed": False, "year_of_experience": "0"},
                "education_details": {"degrees": [{"degree_name": "B.Tech", "specialization": "Computer Science & Engineering", "college_name": "Bangalore Institute of Technology", "year_of_passing": 2022, "percentage": 78.5}]},
                "disability_details": {"is_disabled": True, "disability_type": "Locomotor Disability", "disability_percentage": 50.0},
                "other": {"skills": ["Python", "FastAPI", "React", "PostgreSQL", "Git"]},
            },
            {
                "name": "Ananya Krishnan",
                "gender": "female",
                "email": "ananya.krishnan@demo.winvinaya.com",
                "phone": "9876543212",
                "whatsapp_number": "9876543212",
                "dob": date(1999, 8, 22),
                "pincode": "600001",
                "city": "Chennai",
                "district": "Chennai",
                "state": "Tamil Nadu",
                "guardian_details": {"parent_name": "Krishnan S", "relationship": "Father", "parent_phone": "9876543213"},
                "work_experience": {"is_experienced": True, "currently_employed": False, "year_of_experience": "1"},
                "education_details": {"degrees": [{"degree_name": "B.Com", "specialization": "Accounting and Finance", "college_name": "Loyola College Chennai", "year_of_passing": 2021, "percentage": 82.0}]},
                "disability_details": {"is_disabled": True, "disability_type": "Hearing Impairment (Deaf and Hard of Hearing)", "disability_percentage": 70.0},
                "other": {"skills": ["Excel", "Tally Prime", "Financial Analysis", "English"]},
            },
            {
                "name": "Karthik Raja",
                "gender": "male",
                "email": "karthik.raja@demo.winvinaya.com",
                "phone": "9876543214",
                "whatsapp_number": "9876543214",
                "dob": date(1997, 11, 3),
                "pincode": "500001",
                "city": "Hyderabad",
                "district": "Hyderabad",
                "state": "Telangana",
                "guardian_details": {"parent_name": "Srinivas Rao", "relationship": "Father", "parent_phone": "9876543215"},
                "work_experience": {"is_experienced": True, "currently_employed": True, "year_of_experience": "2"},
                "education_details": {"degrees": [{"degree_name": "B.C.A", "specialization": "Software Applications", "college_name": "Osmania University", "year_of_passing": 2020, "percentage": 74.0}]},
                "disability_details": {"is_disabled": True, "disability_type": "Low Vision", "disability_percentage": 40.0},
                "other": {"skills": ["Manual Testing", "Selenium WebDriver", "Python", "Jira"]},
            },
            {
                "name": "Deepa Sundaram",
                "gender": "female",
                "email": "deepa.sundaram@demo.winvinaya.com",
                "phone": "9876543216",
                "whatsapp_number": "9876543216",
                "dob": date(2001, 1, 19),
                "pincode": "641001",
                "city": "Coimbatore",
                "district": "Coimbatore",
                "state": "Tamil Nadu",
                "guardian_details": {"parent_name": "Sundaram P", "relationship": "Father", "parent_phone": "9876543217"},
                "work_experience": {"is_experienced": False, "currently_employed": False, "year_of_experience": "0"},
                "education_details": {"degrees": [{"degree_name": "B.B.A", "specialization": "Human Resources", "college_name": "PSG College of Arts and Science", "year_of_passing": 2023, "percentage": 80.5}]},
                "disability_details": {"is_disabled": True, "disability_type": "Locomotor Disability", "disability_percentage": 60.0},
                "other": {"skills": ["Communication", "HR Coordination", "MS Office", "Client Servicing"]},
            },
            {
                "name": "Arjun Nair",
                "gender": "male",
                "email": "arjun.nair@demo.winvinaya.com",
                "phone": "9876543218",
                "whatsapp_number": "9876543218",
                "dob": date(1996, 7, 30),
                "pincode": "682001",
                "city": "Kochi",
                "district": "Ernakulam",
                "state": "Kerala",
                "guardian_details": {"parent_name": "Unnikrishnan Nair", "relationship": "Father", "parent_phone": "9876543219"},
                "work_experience": {"is_experienced": False, "currently_employed": False, "year_of_experience": "0"},
                "education_details": {"degrees": [{"degree_name": "B.Sc", "specialization": "Information Technology", "college_name": "Maharaja's College", "year_of_passing": 2022, "percentage": 71.0}]},
                "disability_details": {"is_disabled": True, "disability_type": "Speech and Language Disability", "disability_percentage": 45.0},
                "other": {"skills": ["React", "TypeScript", "Node.js", "MongoDB", "Git"]},
            },
            {
                "name": "Pooja Hegde",
                "gender": "female",
                "email": "pooja.hegde@demo.winvinaya.com",
                "phone": "9876543220",
                "whatsapp_number": "9876543220",
                "dob": date(2000, 3, 15),
                "pincode": "575001",
                "city": "Mangaluru",
                "district": "Dakshina Kannada",
                "state": "Karnataka",
                "guardian_details": {"parent_name": "Manjunath Hegde", "relationship": "Father", "parent_phone": "9876543221"},
                "work_experience": {"is_experienced": False, "currently_employed": False, "year_of_experience": "0"},
                "education_details": {"degrees": [{"degree_name": "B.E", "specialization": "Information Science", "college_name": "NMAM Institute of Technology", "year_of_passing": 2023, "percentage": 85.0}]},
                "disability_details": {"is_disabled": True, "disability_type": "Locomotor Disability", "disability_percentage": 55.0},
                "other": {"skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"]},
            },
            {
                "name": "Vikas Kulkarni",
                "gender": "male",
                "email": "vikas.kulkarni@demo.winvinaya.com",
                "phone": "9876543222",
                "whatsapp_number": "9876543222",
                "dob": date(1995, 9, 10),
                "pincode": "580001",
                "city": "Hubballi",
                "district": "Dharwad",
                "state": "Karnataka",
                "guardian_details": {"parent_name": "Anand Kulkarni", "relationship": "Father", "parent_phone": "9876543223"},
                "work_experience": {"is_experienced": True, "currently_employed": False, "year_of_experience": "3"},
                "education_details": {"degrees": [{"degree_name": "B.Com", "specialization": "Banking and Finance", "college_name": "Karnataka University", "year_of_passing": 2018, "percentage": 68.0}]},
                "disability_details": {"is_disabled": True, "disability_type": "Hearing Impairment (Deaf and Hard of Hearing)", "disability_percentage": 65.0},
                "other": {"skills": ["Banking Operations", "Excel Advanced", "Data Processing", "Tally"]},
            },
            {
                "name": "Sneha Patil",
                "gender": "female",
                "email": "sneha.patil@demo.winvinaya.com",
                "phone": "9876543224",
                "whatsapp_number": "9876543224",
                "dob": date(1999, 12, 5),
                "pincode": "411001",
                "city": "Pune",
                "district": "Pune",
                "state": "Maharashtra",
                "guardian_details": {"parent_name": "Sanjay Patil", "relationship": "Father", "parent_phone": "9876543225"},
                "work_experience": {"is_experienced": False, "currently_employed": False, "year_of_experience": "0"},
                "education_details": {"degrees": [{"degree_name": "B.C.A", "specialization": "Computer Science", "college_name": "Fergusson College Pune", "year_of_passing": 2022, "percentage": 76.5}]},
                "disability_details": {"is_disabled": True, "disability_type": "Locomotor Disability", "disability_percentage": 40.0},
                "other": {"skills": ["Python", "Selenium", "API Testing", "Postman", "Git"]},
            },
            {
                "name": "Mohammed Zeeshan",
                "gender": "male",
                "email": "mohammed.zeeshan@demo.winvinaya.com",
                "phone": "9876543226",
                "whatsapp_number": "9876543226",
                "dob": date(1998, 4, 18),
                "pincode": "560025",
                "city": "Bengaluru",
                "district": "Bengaluru Urban",
                "state": "Karnataka",
                "guardian_details": {"parent_name": "Mohammed Farooq", "relationship": "Father", "parent_phone": "9876543227"},
                "work_experience": {"is_experienced": True, "currently_employed": True, "year_of_experience": "1.5"},
                "education_details": {"degrees": [{"degree_name": "B.E", "specialization": "Electronics and Communication", "college_name": "BMS College of Engineering", "year_of_passing": 2021, "percentage": 79.5}]},
                "disability_details": {"is_disabled": True, "disability_type": "Blindness", "disability_percentage": 100.0},
                "other": {"skills": ["Python", "Accessibility Testing", "JAWS", "NVDA", "HTML"]},
            },
            {
                "name": "Kavitha R",
                "gender": "female",
                "email": "kavitha.r@demo.winvinaya.com",
                "phone": "9876543228",
                "whatsapp_number": "9876543228",
                "dob": date(2000, 6, 12),
                "pincode": "570020",
                "city": "Mysuru",
                "district": "Mysuru",
                "state": "Karnataka",
                "guardian_details": {"parent_name": "Sundaram M", "relationship": "Father", "parent_phone": "9876543229"},
                "work_experience": {"is_experienced": False, "currently_employed": False, "year_of_experience": "0"},
                "education_details": {"degrees": [{"degree_name": "B.Com", "specialization": "Accounting", "college_name": "University of Mysore", "year_of_passing": 2023, "percentage": 79.0}]},
                "disability_details": {"is_disabled": True, "disability_type": "Hearing Impairment (Deaf and Hard of Hearing)", "disability_percentage": 80.0},
                "other": {"skills": ["Tally Prime", "Excel", "Accounting", "Billing"]},
            },
        ]

        candidates = []
        for cd in candidates_raw:
            other_data = dict(cd.get("other") or {})
            other_data["registration_type"] = "Registered"
            cand = Candidate(
                public_id=uuid.uuid4(),
                name=cd["name"],
                gender=cd["gender"],
                email=cd["email"],
                phone=cd["phone"],
                whatsapp_number=cd["whatsapp_number"],
                dob=cd["dob"],
                pincode=cd["pincode"],
                city=cd["city"],
                district=cd["district"],
                state=cd["state"],
                guardian_details=cd["guardian_details"],
                work_experience=cd["work_experience"],
                education_details=cd["education_details"],
                disability_details=cd["disability_details"],
                other=other_data,
                is_deleted=False,
            )
            session.add(cand)
            candidates.append(cand)

        await session.flush()
        print(f"  -> Created {len(candidates)} candidates.")

        # -------------------------------------------------------------
        # 3. SCREENING & CAREER COUNSELING (Multi-Tab Distribution)
        # -------------------------------------------------------------
        print("\n[3/9] Seeding Candidate Screenings and Counselings across status tabs...")
        # Distribution:
        # Cand 0, 1, 2, 4, 5 -> Screening: 'Completed', Counseling: 'selected' (Selected for Counseling & Placement match ready!)
        # Cand 3, 6 -> Screening: 'In Progress'
        # Cand 7 -> Screening: 'Rejected'
        # Cand 8, 9 -> Not Screened (NO screening row -> Shows on 'Not Screened' tab & 'Yet To Be Screened' card!)

        completed_indices = [0, 1, 2, 4, 5]
        in_progress_indices = [3, 6]
        rejected_indices = [7]

        tracks = {
            0: "Full Stack Python & React Development",
            1: "Financial Accounting & BPM",
            2: "QA Automation & Accessibility Testing",
            3: "Customer Relationship Coordination",
            4: "Frontend Web Development",
            5: "Full Stack Web Development",
            6: "Financial Data Operations",
            7: "Software Quality Engineering",
            8: "Digital Accessibility Assurance",
            9: "Accounts & Tally Operations",
        }

        # Seed Completed Screenings & Counselings
        for idx in completed_indices:
            cand = candidates[idx]
            skills_raw = candidates_raw[idx]["other"]["skills"]
            
            sc = CandidateScreening(
                candidate_id=cand.id,
                status="Completed",
                consent_status="granted",
                consent_at=datetime.utcnow() - timedelta(days=20 - idx),
                consent_ip="192.168.1.100",
                previous_training={"has_training": False},
                documents_upload={"aadhaar": True, "disability_certificate": True, "marksheet": True},
                skills={"technical": skills_raw, "soft_skills": ["Communication", "Teamwork"]},
                family_details=[{
                    "relation": "Father",
                    "occupation": "Salaried / Business",
                    "annual_income": "300000",
                    "dependents": 3
                }],
                others={
                    "screener_feedback": f"Demonstrated high aptitude and clear fundamentals. Recommended for {tracks[idx]}.",
                    "technical_rating": 4,
                    "communication_rating": 4,
                    "family_annual_income": "300000",
                    "source_of_info": "Partner NGO Referral"
                },
                screened_by_id=admin_id,
                is_deleted=False,
            )
            session.add(sc)

            # Counseling: skills format MUST include "name" and "level" for the UI dropdown!
            counseling_skills = [
                {"name": s, "level": "Advanced" if i == 0 else "Intermediate", "rating": 4, "skill_name": s}
                for i, s in enumerate(skills_raw)
            ]
            cs = CandidateCounseling(
                candidate_id=cand.id,
                skills=counseling_skills,
                feedback=f"Candidate has clear technical vision and high motivation for {tracks[idx]}.",
                questions=[
                    {"question": "Career goal in 2", "answer": f"Work as a productive software specialist in {tracks[idx]}"},
                    {"question": "Comfortable with hybrid work?", "answer": "Yes, fully comfortable with hybrid commute"}
                ],
                others={
                    "recommended_track": tracks[idx],
                    "batch_timing": "Morning 9:30 AM - 4:30 PM",
                    "suitable_job_roles": [tracks[idx]],
                    "assigned_to": ["Senior Career Counselor"],
                },
                workexperience=[{
                    "job_title": "Fresher" if not candidates_raw[idx]["work_experience"]["is_experienced"] else "Junior Associate",
                    "company": "None" if not candidates_raw[idx]["work_experience"]["is_experienced"] else "Previous Firm",
                    "years_of_experience": candidates_raw[idx]["work_experience"]["year_of_experience"],
                    "currently_working": candidates_raw[idx]["work_experience"]["currently_employed"]
                }],
                counselor_name="Senior Career Counselor",
                status="selected",
                counselor_id=admin_id,
                counseling_date=datetime.utcnow() - timedelta(days=15 - idx),
                is_deleted=False,
            )
            session.add(cs)

        # Seed In Progress Screenings
        for idx in in_progress_indices:
            cand = candidates[idx]
            skills_raw = candidates_raw[idx]["other"]["skills"]
            sc = CandidateScreening(
                candidate_id=cand.id,
                status="In Progress",
                consent_status="granted",
                consent_at=datetime.utcnow() - timedelta(days=5),
                consent_ip="192.168.1.100",
                previous_training={"has_training": False},
                documents_upload={"aadhaar": True},
                skills={"technical": skills_raw},
                family_details=[{"relation": "Parent", "occupation": "Self-employed", "annual_income": "240000", "dependents": 2}],
                others={"screener_feedback": "Initial screening underway. Verification of disability certificate in progress."},
                screened_by_id=admin_id,
                is_deleted=False,
            )
            session.add(sc)

        # Seed Rejected Screening
        for idx in rejected_indices:
            cand = candidates[idx]
            sc = CandidateScreening(
                candidate_id=cand.id,
                status="Rejected",
                consent_status="granted",
                consent_at=datetime.utcnow() - timedelta(days=7),
                consent_ip="192.168.1.100",
                previous_training={"has_training": False},
                documents_upload={},
                skills={"technical": ["Basic Computers"]},
                family_details=[{"relation": "Parent", "occupation": "Worker", "annual_income": "180000", "dependents": 4}],
                others={"screener_feedback": "Candidate relocated out of region and is currently unavailable for regular cohort."},
                screened_by_id=admin_id,
                is_deleted=False,
            )
            session.add(sc)

        await session.flush()
        print("  -> Screenings seeded: 5 Completed, 2 In Progress, 1 Rejected, 2 Not Screened (Tabs fully populated!).")

        # -------------------------------------------------------------
        # 4. CANDIDATE DOCUMENTS (All standard document types attached)
        # -------------------------------------------------------------
        print("\n[4/9] Attaching demo documents to candidates...")
        # Fully submitted candidates (4): get all required document types
        full_doc_candidates = [candidates[0], candidates[1], candidates[2], candidates[4]]
        # Partially submitted candidates (4): get 3-4 documents
        partial_doc_candidates = [candidates[3], candidates[5], candidates[6], candidates[7]]

        doc_templates = [
            ("resume", "Resume_Candidate_Profile.pdf", "application/pdf", 1048576),
            ("disability_certificate", "UDID_Disability_Certificate.pdf", "application/pdf", 2097152),
            ("10th_certificate", "SSLC_10th_Standard_Marksheet.pdf", "application/pdf", 1572864),
            ("12th_certificate", "HSC_12th_Standard_Marksheet.pdf", "application/pdf", 1572864),
            ("degree_certificate", "Bachelor_Degree_Convocation.pdf", "application/pdf", 2500000),
            ("pan_card", "Government_PAN_Card.pdf", "application/pdf", 800000),
            ("aadhar_card", "Aadhar_Identity_Card.pdf", "application/pdf", 950000),
            ("passport_photo", "Formal_Passport_Photo.jpg", "image/jpeg", 450000),
            ("consent_form", "WinVinaya_Consent_Declaration.pdf", "application/pdf", 650000),
        ]

        doc_count = 0
        for cand in full_doc_candidates:
            for dtype, dname, mime, fsize in doc_templates:
                session.add(CandidateDocument(
                    candidate_id=cand.id,
                    document_type=dtype,
                    document_name=dname,
                    file_path=f"/uploads/documents/{cand.id}/{dname}",
                    file_size=fsize,
                    mime_type=mime,
                    description=f"Verified official {dtype.replace('_', ' ')}",
                    document_source="candidate",
                    is_active=True,
                    uploaded_by_id=admin_id,
                ))
                doc_count += 1

        for cand in partial_doc_candidates:
            for dtype, dname, mime, fsize in doc_templates[:4]:
                session.add(CandidateDocument(
                    candidate_id=cand.id,
                    document_type=dtype,
                    document_name=dname,
                    file_path=f"/uploads/documents/{cand.id}/{dname}",
                    file_size=fsize,
                    mime_type=mime,
                    description=f"Verified official {dtype.replace('_', ' ')}",
                    document_source="candidate",
                    is_active=True,
                    uploaded_by_id=admin_id,
                ))
                doc_count += 1

        await session.flush()
        print(f"  -> Attached {doc_count} demo documents (Completed: 4, Pending: 4, Not Collected: 2).")

        # -------------------------------------------------------------
        # 5. TRAINING BATCHES, ALLOCATIONS, PLANS, ATTENDANCE, MOCK INTERVIEWS
        # -------------------------------------------------------------
        print("\n[5/9] Seeding Training Batches, Weekly Plans, Attendance for Today, and Mocks...")
        batch1 = TrainingBatch(
            public_id=uuid.uuid4(),
            batch_name="Batch-2026-01: Full Stack Python & React Development (PwD Cohort 12)",
            disability_types=["Locomotor Disability", "Hearing Impairment (Deaf and Hard of Hearing)", "Low Vision"],
            start_date=date(2026, 1, 5),
            approx_close_date=date(2026, 4, 15),
            total_extension_days=0,
            courses=["Python Core", "React JS", "FastAPI", "PostgreSQL", "Soft Skills"],
            duration={"duration_months": 3.5, "duration_weeks": 14, "display": "3.5 Months"},
            status="in_progress",
            other={"domain": "Full Stack Web Development", "training_mode": "Hybrid"},
            owner_id=admin_id,
            is_deleted=False,
        )
        batch2 = TrainingBatch(
            public_id=uuid.uuid4(),
            batch_name="Batch-2026-02: Quality Assurance & Test Automation (Inclusive Track)",
            disability_types=["Locomotor Disability", "Blindness", "Low Vision"],
            start_date=date(2026, 2, 1),
            approx_close_date=date(2026, 5, 10),
            total_extension_days=0,
            courses=["Manual Testing", "Selenium WebDriver", "Python Test Automation", "Jira & Bugzilla"],
            duration={"duration_months": 3.0, "duration_weeks": 12, "display": "3 Months"},
            status="in_progress",
            other={"domain": "Software Testing & QA", "training_mode": "Online"},
            owner_id=admin_id,
            is_deleted=False,
        )
        session.add_all([batch1, batch2])
        await session.flush()

        batch1_candidates = [candidates[0], candidates[1], candidates[4], candidates[5], candidates[6]]
        batch2_candidates = [candidates[2], candidates[3], candidates[7], candidates[8], candidates[9]]

        for cand in batch1_candidates:
            session.add(TrainingCandidateAllocation(
                public_id=uuid.uuid4(),
                batch_id=batch1.id,
                candidate_id=cand.id,
                status="Enrolled",
                is_dropout=False,
                is_deleted=False,
            ))

        for cand in batch2_candidates:
            session.add(TrainingCandidateAllocation(
                public_id=uuid.uuid4(),
                batch_id=batch2.id,
                candidate_id=cand.id,
                status="Enrolled",
                is_dropout=False,
                is_deleted=False,
            ))

        await session.flush()

        # Training Batch Plans for CURRENT WEEK (Monday Nov 2 to Friday Nov 6, 2026)
        # Multiple periods per day so calendar is rich and realistic
        today = date.today()
        # Find Monday of this week
        monday = today - timedelta(days=today.weekday())

        b1_schedule = [
            ("09:30:00", "11:30:00", "Python Data Structures & OOP In-depth"),
            ("11:45:00", "13:15:00", "FastAPI Asynchronous Routing & Schema Validation"),
            ("14:00:00", "16:30:00", "PostgreSQL Database Relations & Hands-on Lab"),
        ]

        b2_schedule = [
            ("09:30:00", "11:30:00", "Selenium WebDriver Automation Fundamentals"),
            ("11:45:00", "13:15:00", "Pytest Test Suite Structuring & Assertions"),
            ("14:00:00", "16:30:00", "Web Accessibility (WCAG 2.1) Automated Auditing"),
        ]

        plan_count = 0
        for day_offset in range(5): # Monday to Friday
            plan_date = monday + timedelta(days=day_offset)

            # Batch 1 periods
            for st, et, act_name in b1_schedule:
                t_start = time.fromisoformat(st)
                t_end = time.fromisoformat(et)
                session.add(TrainingBatchPlan(
                    public_id=uuid.uuid4(),
                    batch_id=batch1.id,
                    date=plan_date,
                    start_time=t_start,
                    end_time=t_end,
                    activity_type="course",
                    activity_name=act_name,
                    trainer="Senior Technical Trainer",
                    trainer_user_id=admin_id,
                    notes=f"Delivered curriculum module on {act_name} with interactive coding exercises.",
                    is_deleted=False,
                ))
                plan_count += 1

            # Batch 2 periods
            for st, et, act_name in b2_schedule:
                t_start = time.fromisoformat(st)
                t_end = time.fromisoformat(et)
                session.add(TrainingBatchPlan(
                    public_id=uuid.uuid4(),
                    batch_id=batch2.id,
                    date=plan_date,
                    start_time=t_start,
                    end_time=t_end,
                    activity_type="course",
                    activity_name=act_name,
                    trainer="Lead QA Specialist",
                    trainer_user_id=admin_id,
                    notes=f"Hands-on automation lab on {act_name}.",
                    is_deleted=False,
                ))
                plan_count += 1

        print(f"  -> Created {plan_count} training plan periods across current week for Batch 1 & Batch 2.")

        # Training Attendance: Mark attendance for TODAY and past days of this week for BOTH batches!
        attendance_count = 0
        days_to_mark = [monday + timedelta(days=d) for d in range(today.weekday() + 1)] # Monday up to Today

        for d in days_to_mark:
            # Batch 1 candidates
            for i, cand in enumerate(batch1_candidates):
                session.add(TrainingAttendance(
                    batch_id=batch1.id,
                    candidate_id=cand.id,
                    date=d,
                    status="present" if (i + d.day) % 7 != 0 else "late",
                    remarks="Attended scheduled training sessions on time.",
                    is_deleted=False,
                ))
                attendance_count += 1

            # Batch 2 candidates
            for i, cand in enumerate(batch2_candidates):
                session.add(TrainingAttendance(
                    batch_id=batch2.id,
                    candidate_id=cand.id,
                    date=d,
                    status="present" if (i + d.day) % 6 != 0 else "late",
                    remarks="Present for all automation lab periods.",
                    is_deleted=False,
                ))
                attendance_count += 1

        print(f"  -> Marked {attendance_count} attendance records for today and recent days across both batches.")

        # Assignments for candidates
        for cand in batch1_candidates:
            session.add(TrainingAssignment(
                batch_id=batch1.id,
                candidate_id=cand.id,
                assignment_name="FastAPI & Async PostgreSQL REST API Project",
                description="Build a production-grade CRUD microservice with unit tests and Pydantic validation.",
                course_name=["FastAPI", "PostgreSQL"],
                course_marks={"FastAPI": 45.0, "PostgreSQL": 45.0},
                trainer_id=admin_id,
                marks_obtained=90.0,
                max_marks=100.0,
                assignment_date=monday - timedelta(days=7),
                submission_date=monday - timedelta(days=2),
                others={"feedback": "Flawless API schema adherence and clean async repository pattern."},
                is_deleted=False,
            ))

        for cand in batch2_candidates:
            session.add(TrainingAssignment(
                batch_id=batch2.id,
                candidate_id=cand.id,
                assignment_name="Automated Test Suite for E-Commerce Flow",
                description="Implement Selenium WebDriver automation framework with Page Object Model.",
                course_name=["Selenium", "Python Automation"],
                course_marks={"Selenium": 44.0, "Python": 44.0},
                trainer_id=admin_id,
                marks_obtained=88.0,
                max_marks=100.0,
                assignment_date=monday - timedelta(days=7),
                submission_date=monday - timedelta(days=2),
                others={"feedback": "Well-structured test framework with robust HTML reporting."},
                is_deleted=False,
            ))

        # Mock Interviews: Matching EXACT SkillSchema & QuestionSchema requirements!
        mock_candidates_b1 = [batch1_candidates[0], batch1_candidates[1], batch1_candidates[2]]
        mock_candidates_b2 = [batch2_candidates[0], batch2_candidates[1]]

        for cand in mock_candidates_b1:
            session.add(TrainingMockInterview(
                batch_id=batch1.id,
                candidate_id=cand.id,
                interviewer_id=admin_id,
                interviewer_name="Senior Technical Trainer",
                interview_date=datetime.utcnow() - timedelta(days=2),
                questions=[
                    {"question": "Explain async/await and concurrency in Python.", "answer": "Demonstrated async task scheduling, event loops, and coroutines."},
                    {"question": "How do you handle relational joins in PostgreSQL?", "answer": "Explained inner/outer joins, indexing strategies, and execution plans."}
                ],
                skills=[
                    {"skill": "Python", "level": "Expert", "rating": 9.0},
                    {"skill": "FastAPI", "level": "Intermediate", "rating": 8.5},
                    {"skill": "React", "level": "Intermediate", "rating": 8.0}
                ],
                overall_rating=8.5,
                feedback="Candidate possesses exceptional technical clarity and is thoroughly ready for client placement rounds.",
                others={
                    "interview_type": "internal",
                    "interview_category": "domain",
                    "technical_rating": 8.5,
                    "communication_rating": 8.5,
                    "status": "completed"
                },
                is_deleted=False,
            ))

        for cand in mock_candidates_b2:
            session.add(TrainingMockInterview(
                batch_id=batch2.id,
                candidate_id=cand.id,
                interviewer_id=admin_id,
                interviewer_name="Lead QA Specialist",
                interview_date=datetime.utcnow() - timedelta(days=1),
                questions=[
                    {"question": "What is the difference between find_element and find_elements in Selenium?", "answer": "Correctly articulated single WebElement vs List return with NoSuchElementException behavior."},
                    {"question": "Explain WCAG 2.1 color contrast and ARIA labels.", "answer": "Described minimum 4.5:1 ratio and accessible screen reader naming."}
                ],
                skills=[
                    {"skill": "Selenium WebDriver", "level": "Expert", "rating": 8.8},
                    {"skill": "Python Testing", "level": "Intermediate", "rating": 8.2},
                    {"skill": "Accessibility Audit", "level": "Expert", "rating": 9.0}
                ],
                overall_rating=8.7,
                feedback="Strong automation skills and solid grasp of accessibility guidelines.",
                others={
                    "interview_type": "internal",
                    "interview_category": "domain",
                    "technical_rating": 8.7,
                    "communication_rating": 8.5,
                    "status": "completed"
                },
                is_deleted=False,
            ))

        await session.flush()
        print("  -> Seeded training batches, allocations, plans, attendance, assignments, and mock interviews.")

        # -------------------------------------------------------------
        # 6. CRM (COMPANIES, CONTACTS, LEADS, DEALS, TASKS, ACTIVITIES)
        # -------------------------------------------------------------
        print("\n[6/9] Seeding CRM (Companies, Contacts, Leads, Deals, Tasks, Activities)...")
        companies_seed = [
            {
                "name": "Tech Mahindra Foundation",
                "industry": "IT Services & Consulting",
                "company_size": CompanySize.ENTERPRISE,
                "website": "https://www.techmahindra.com",
                "phone": "+91-80-66440000",
                "email": "csr.diversity@techmahindra.com",
                "status": CompanyStatus.CUSTOMER,
                "address": {
                    "street": "Electronics City, Phase 1, Hosur Road",
                    "city": "Bengaluru",
                    "state": "Karnataka",
                    "pincode": "560100"
                }
            },
            {
                "name": "Infosys BPM",
                "industry": "Business Process Management",
                "company_size": CompanySize.ENTERPRISE,
                "website": "https://www.infosysbpm.com",
                "phone": "+91-821-2404000",
                "email": "diversity.hiring@infosysbpm.com",
                "status": CompanyStatus.CUSTOMER,
                "address": {
                    "street": "Hebbal Electronic City, Hootagalli",
                    "city": "Mysuru",
                    "state": "Karnataka",
                    "pincode": "570027"
                }
            },
            {
                "name": "Wipro Technologies",
                "industry": "IT Software & Global Solutions",
                "company_size": CompanySize.ENTERPRISE,
                "website": "https://www.wipro.com",
                "phone": "+91-80-28440011",
                "email": "campus.hiring@wipro.com",
                "status": CompanyStatus.PROSPECT,
                "address": {
                    "street": "Doddakannelli, Sarjapur Road",
                    "city": "Bengaluru",
                    "state": "Karnataka",
                    "pincode": "560035"
                }
            },
            {
                "name": "Amazon India Operations",
                "industry": "E-Commerce & Cloud Computing",
                "company_size": CompanySize.ENTERPRISE,
                "website": "https://www.amazon.jobs",
                "phone": "+91-40-67890000",
                "email": "in-pwd-hiring@amazon.com",
                "status": CompanyStatus.CUSTOMER,
                "address": {
                    "street": "Financial District, Nanakramguda",
                    "city": "Hyderabad",
                    "state": "Telangana",
                    "pincode": "500032"
                }
            },
        ]

        companies = []
        for c_data in companies_seed:
            comp = Company(
                public_id=uuid.uuid4(),
                name=c_data["name"],
                industry=c_data["industry"],
                company_size=c_data["company_size"],
                website=c_data["website"],
                phone=c_data["phone"],
                email=c_data["email"],
                status=c_data["status"],
                address=c_data["address"],
                is_deleted=False,
            )
            session.add(comp)
            companies.append(comp)

        await session.flush()

        contacts_seed = [
            ("Priya", "Sharma", "priya.sharma@techmahindra.com", "+91-9880011223", "Director - Talent Acquisition & Diversity", "HR", companies[0].id, True),
            ("Amit", "Verma", "amit.verma@techmahindra.com", "+91-9880011224", "Senior Engineering Manager", "Technology", companies[0].id, False),
            ("Rajesh", "Kumar", "rajesh.kumar@infosysbpm.com", "+91-9880011225", "Head of Inclusive Hiring", "HR", companies[1].id, True),
            ("Pooja", "Nair", "pooja.nair@infosysbpm.com", "+91-9880011226", "CSR Lead", "CSR", companies[1].id, False),
            ("Sneha", "Rao", "sneha.rao@wipro.com", "+91-9880011227", "Diversity Program Lead", "HR", companies[2].id, True),
            ("Vikram", "Patel", "vikram.patel@amazon.com", "+91-9880011228", "Principal HR Business Partner", "Operations", companies[3].id, True),
        ]

        contacts = []
        for fn, ln, em, ph, des, dep, cid, is_p in contacts_seed:
            cnt = Contact(
                public_id=uuid.uuid4(),
                company_id=cid,
                first_name=fn,
                last_name=ln,
                email=em,
                phone=ph,
                designation=des,
                department=dep,
                is_primary=is_p,
                is_decision_maker=is_p,
                contact_source=ContactSource.REFERRAL,
                is_deleted=False,
            )
            session.add(cnt)
            contacts.append(cnt)

        await session.flush()

        # Leads & Deals
        leads_seed = [
            ("Inclusive Sourcing Cohort Q2", "Hiring drive for 15 PwD junior software engineers across Bengaluru campus", LeadSource.PARTNER, LeadStatus.QUALIFIED, 1500000.0, companies[0].id, contacts[0].id),
            ("Accessibility QA Testing Cohort", "Engagement for specialized accessibility manual & automation testers", LeadSource.WEBSITE, LeadStatus.CONTACTED, 1200000.0, companies[2].id, contacts[4].id),
            ("Customer Support Operations Associate Drive", "Non-voice associate positions for PwD candidates", LeadSource.REFERRAL, LeadStatus.QUALIFIED, 2000000.0, companies[3].id, contacts[5].id),
            ("Banking Operations & Document Verification Team", "Back-office and analyst requirements for financial domain", LeadSource.EVENT, LeadStatus.NEW, 800000.0, companies[1].id, contacts[2].id),
        ]

        leads = []
        for title, desc, l_src, l_stat, val, cid, cnt_id in leads_seed:
            lead = Lead(
                public_id=uuid.uuid4(),
                company_id=cid,
                contact_id=cnt_id,
                assigned_to=admin_id,
                title=title,
                description=desc,
                lead_source=l_src,
                lead_status=l_stat,
                estimated_value=val,
                currency="INR",
                expected_close_date=date.today() + timedelta(days=45),
                is_deleted=False,
            )
            session.add(lead)
            leads.append(lead)

        await session.flush()

        deals_seed = [
            ("Tech Mahindra PwD Hiring Cohort 2026", DealStage.PROPOSAL, DealType.NEW_BUSINESS, 75, 1500000.0, companies[0].id, contacts[0].id, leads[0].id),
            ("Infosys Inclusive Tech Talent Drive", DealStage.NEGOTIATION, DealType.RENEWAL, 90, 2200000.0, companies[1].id, contacts[2].id, leads[3].id),
            ("Amazon Operations Diversity Initiative", DealStage.CLOSED_WON, DealType.NEW_BUSINESS, 100, 3000000.0, companies[3].id, contacts[5].id, leads[2].id),
            ("Wipro Quality Assurance Internship Cohort", DealStage.QUALIFICATION, DealType.NEW_BUSINESS, 40, 1200000.0, companies[2].id, contacts[4].id, leads[1].id),
        ]

        deals = []
        for title, stage, d_type, prob, val, cid, cnt_id, lid in deals_seed:
            deal = Deal(
                public_id=uuid.uuid4(),
                company_id=cid,
                contact_id=cnt_id,
                lead_id=lid,
                assigned_to=admin_id,
                title=title,
                description=f"Strategic partnership deal with {title}",
                deal_stage=stage,
                deal_type=d_type,
                win_probability=prob,
                deal_value=val,
                currency="INR",
                expected_close_date=date.today() + timedelta(days=30),
                is_deleted=False,
            )
            session.add(deal)
            deals.append(deal)

        await session.flush()

        tasks_seed = [
            ("Schedule follow-up call with Priya Sharma", "Discuss shortlisted candidate profiles for Full Stack developer role", CRMTaskType.CALL, CRMTaskPriority.HIGH, CRMTaskStatus.IN_PROGRESS, CRMRelatedToType.COMPANY, companies[0].id),
            ("Send revised CSR partnership proposal to Infosys", "Attach batch curriculum and placement success metrics deck", CRMTaskType.EMAIL, CRMTaskPriority.MEDIUM, CRMTaskStatus.PENDING, CRMRelatedToType.DEAL, deals[1].id),
            ("Review Amazon offer letters & accommodation readiness", "Verify screen magnifier and transport assistance for selected candidates", CRMTaskType.MEETING, CRMTaskPriority.HIGH, CRMTaskStatus.COMPLETED, CRMRelatedToType.COMPANY, companies[3].id),
            ("Prepare presentation for Wipro accessibility hiring", "Highlight candidate performance in Selenium and Python automation", CRMTaskType.FOLLOW_UP, CRMTaskPriority.LOW, CRMTaskStatus.PENDING, CRMRelatedToType.LEAD, leads[1].id),
        ]

        for title, desc, t_type, prio, stat, rel_type, rel_id in tasks_seed:
            session.add(CRMTask(
                public_id=uuid.uuid4(),
                title=title,
                description=desc,
                task_type=t_type,
                priority=prio,
                status=stat,
                assigned_to=admin_id,
                created_by=admin_id,
                related_to_type=rel_type,
                related_to_id=rel_id,
                due_date=datetime.utcnow() + timedelta(days=3),
                is_deleted=False,
            ))

        for idx in range(4):
            session.add(CRMActivityLog(
                public_id=uuid.uuid4(),
                entity_type=CRMEntityType.COMPANY,
                entity_id=companies[idx].id,
                activity_type=CRMActivityType.MEETING_HELD,
                performed_by=admin_id,
                summary=f"Quarterly Business Alignment with {companies[idx].name}",
                details={"notes": "Met with hiring panel to review PwD candidate sourcing and interview pipelines."},
                is_deleted=False,
            ))

        await session.flush()
        print(f"  -> Created {len(companies)} companies, {len(contacts)} contacts, {len(leads)} leads, {len(deals)} deals, 4 tasks, 4 activity logs.")

        # -------------------------------------------------------------
        # 7. PLACEMENT (JOB ROLES, MAPPINGS, INTERVIEWS, OFFERS, NOTES)
        # -------------------------------------------------------------
        print("\n[7/9] Seeding Placement (Job Roles, Candidate Mappings, Offers)...")
        job_roles_seed = [
            {
                "title": "Junior Full Stack Developer",
                "description": "Responsible for developing clean, accessible web applications using Python (FastAPI) and React.js. Candidates with PwD background are encouraged.",
                "company_id": companies[0].id,
                "contact_id": contacts[0].id,
                "location": {"city": "Bengaluru", "state": "Karnataka", "mode": "Hybrid"},
                "salary_range": {"min": 450000, "max": 550000, "currency": "INR", "display": "₹4.5 - ₹5.5 LPA"},
                "experience": {"min_years": 0, "max_years": 1, "display": "0 - 1 year"},
                "no_of_vacancies": 5,
                "requirements": {
                    "skills": ["python", "react", "postgresql", "fastapi"],
                    "qualifications": ["b.tech", "b.e", "b.c.a", "b.sc"],
                    "disability_preferred": ["locomotor disability", "hearing impairment", "low vision"]
                },
                "status": JobRoleStatus.ACTIVE,
            },
            {
                "title": "QA Automation Associate",
                "description": "Develop and execute automated test scripts, verify software accessibility standards (WCAG 2.1), and log defect reports.",
                "company_id": companies[2].id,
                "contact_id": contacts[4].id,
                "location": {"city": "Bengaluru", "state": "Karnataka", "mode": "On-site"},
                "salary_range": {"min": 380000, "max": 450000, "currency": "INR", "display": "₹3.8 - ₹4.5 LPA"},
                "experience": {"min_years": 0, "max_years": 2, "display": "0 - 2 years"},
                "no_of_vacancies": 4,
                "requirements": {
                    "skills": ["manual testing", "selenium", "python", "jira"],
                    "qualifications": ["b.tech", "b.c.a", "b.e", "any graduate"],
                    "disability_preferred": ["locomotor disability", "blindness", "low vision"]
                },
                "status": JobRoleStatus.ACTIVE,
            },
            {
                "title": "Operations & Data Analyst",
                "description": "Support data operations, verify accounting documents, create client spreadsheets, and generate monthly metrics reports.",
                "company_id": companies[1].id,
                "contact_id": contacts[2].id,
                "location": {"city": "Mysuru", "state": "Karnataka", "mode": "Hybrid"},
                "salary_range": {"min": 350000, "max": 420000, "currency": "INR", "display": "₹3.5 - ₹4.2 LPA"},
                "experience": {"min_years": 0, "max_years": 1, "display": "0 - 1 year"},
                "no_of_vacancies": 6,
                "requirements": {
                    "skills": ["excel", "tally prime", "financial analysis", "english"],
                    "qualifications": ["b.com", "b.b.a", "b.sc"],
                    "disability_preferred": ["hearing impairment", "locomotor disability"]
                },
                "status": JobRoleStatus.ACTIVE,
            },
            {
                "title": "Customer Support Associate (Non-Voice)",
                "description": "Deliver high-quality customer assistance via email and chat, resolve account queries, and maintain SLA compliance.",
                "company_id": companies[3].id,
                "contact_id": contacts[5].id,
                "location": {"city": "Hyderabad", "state": "Telangana", "mode": "Remote"},
                "salary_range": {"min": 400000, "max": 480000, "currency": "INR", "display": "₹4.0 - ₹4.8 LPA"},
                "experience": {"min_years": 0, "max_years": 1, "display": "0 - 1 year"},
                "no_of_vacancies": 8,
                "requirements": {
                    "skills": ["communication", "hr coordination", "ms office", "english"],
                    "qualifications": ["any graduation", "b.b.a", "b.com"],
                    "disability_preferred": ["locomotor disability", "speech and language disability"]
                },
                "status": JobRoleStatus.ACTIVE,
            },
        ]

        job_roles = []
        for jr_data in job_roles_seed:
            jr = JobRole(
                public_id=uuid.uuid4(),
                title=jr_data["title"],
                description=jr_data["description"],
                company_id=jr_data["company_id"],
                contact_id=jr_data["contact_id"],
                created_by_id=admin_id,
                location=jr_data["location"],
                salary_range=jr_data["salary_range"],
                experience=jr_data["experience"],
                no_of_vacancies=jr_data["no_of_vacancies"],
                requirements=jr_data["requirements"],
                pipeline_stages=[
                    {"id": "shortlisted", "label": "Shortlisted"},
                    {"id": "interview_l1", "label": "L1 Interview"},
                    {"id": "offer_made", "label": "Offer Made"},
                    {"id": "joined", "label": "Joined"}
                ],
                status=jr_data["status"],
                is_visible=True,
                is_deleted=False,
            )
            session.add(jr)
            job_roles.append(jr)

        await session.flush()

        # Candidate Mappings for Junior Full Stack Developer (Job Role 0) & Others
        mappings_seed = [
            (candidates[0].id, job_roles[0].id, PlacementStatus.OFFER_ACCEPTED, 94.0, "Outstanding match for Full Stack Python/React position"),
            (candidates[1].id, job_roles[2].id, PlacementStatus.INTERVIEW_L2, 88.0, "Strong accounting skills, cleared initial round"),
            (candidates[2].id, job_roles[1].id, PlacementStatus.TECHNICAL_ROUND, 91.0, "Great QA foundation, scheduled for tech round"),
            (candidates[4].id, job_roles[0].id, PlacementStatus.SHORTLISTED, 90.0, "Solid React fundamentals, shortlisted for client review"),
            (candidates[5].id, job_roles[0].id, PlacementStatus.MAPPED, 92.0, "Strong React portfolio, ready for resume submission"),
        ]

        mappings = []
        for cand_id, jr_id, p_stat, score, note in mappings_seed:
            pm = PlacementMapping(
                candidate_id=cand_id,
                job_role_id=jr_id,
                mapped_by_id=admin_id,
                match_score=score,
                notes=note,
                status=p_stat,
                is_active=True,
            )
            session.add(pm)
            mappings.append(pm)

        await session.flush()

        # Interview rounds
        interview_types = [
            (mappings[0], 1, InterviewRoundType.TECHNICAL, InterviewMode.VIRTUAL, InterviewResult.PASSED, "Candidate solved algorithms with high proficiency."),
            (mappings[0], 2, InterviewRoundType.HR, InterviewMode.VIRTUAL, InterviewResult.PASSED, "Strong alignment with engineering culture and values."),
            (mappings[1], 1, InterviewRoundType.TECHNICAL, InterviewMode.VIRTUAL, InterviewResult.PASSED, "Sound understanding of ledger management and Tally Prime."),
            (mappings[2], 1, InterviewRoundType.TECHNICAL, InterviewMode.VIRTUAL, InterviewResult.PENDING, "Scheduled for upcoming Friday morning."),
        ]

        for m, r_num, r_type, mode, res, fb in interview_types:
            session.add(PlacementInterview(
                mapping_id=m.id,
                candidate_id=m.candidate_id,
                job_role_id=m.job_role_id,
                round_number=r_num,
                round_type=r_type,
                mode=mode,
                scheduled_at=datetime.utcnow() - timedelta(days=5 - r_num),
                result=res,
                feedback=fb,
                interviewer_id=admin_id,
                is_deleted=False,
            ))

        # Placement Offer for mapping 0
        session.add(PlacementOffer(
            mapping_id=mappings[0].id,
            candidate_id=mappings[0].candidate_id,
            job_role_id=mappings[0].job_role_id,
            offered_ctc=500000.0,
            offered_designation="Junior Full Stack Developer",
            offer_date=date.today() - timedelta(days=2),
            joining_date=date.today() + timedelta(days=14),
            candidate_response=OfferResponse.ACCEPTED,
            joining_status=JoiningStatus.JOINED,
            offered_by_id=admin_id,
            is_deleted=False,
        ))

        session.add(PlacementNote(
            mapping_id=mappings[0].id,
            candidate_id=mappings[0].candidate_id,
            job_role_id=mappings[0].job_role_id,
            created_by_id=admin_id,
            note_type=NoteType.GENERAL,
            content="Candidate successfully accepted the offer and is preparing onboarding documentation.",
            is_deleted=False,
        ))

        await session.flush()
        print(f"  -> Created {len(job_roles)} job roles, {len(mappings)} candidate mappings (3 mapped to Full Stack!), interviews, offer, and notes.")

        # -------------------------------------------------------------
        # 8. DSR (PROJECTS, ACTIVITY TYPES, ACTIVITIES, ASSIGNMENTS, TIMESHEETS, HOLIDAYS)
        # -------------------------------------------------------------
        print("\n[8/9] Seeding DSR (Projects, Activity Types, Activities, User Assignments, Timesheets)...")
        dsr_projects_seed = [
            ("Inclusive Skilling & Empowerment Initiative", "PRJ-SKILL-01", "standard", "CSR funded training programme for youth with disabilities"),
            ("Assistive Technology & Accessibility Lab", "PRJ-A11Y-02", "standard", "R&D project on screen readers and software accessibility benchmarking"),
            ("Corporate Inclusion Advisory & Sensitization", "PRJ-ADVISORY-03", "standard", "Sensitization workshops and corporate consulting for PwD hiring"),
        ]

        projects = []
        for name, code, ptype, desc in dsr_projects_seed:
            proj = DSRProject(
                public_id=uuid.uuid4(),
                name=name,
                project_type=ptype,
                owner_id=admin_id,
                created_by=admin_id,
                is_active=True,
                others={"code": code, "description": desc},
                is_deleted=False,
            )
            session.add(proj)
            projects.append(proj)

        await session.flush()

        # Activity Types with clear categories so the DSR modal shows Common Categories & Grouped Activities!
        act_types_seed = [
            ("Training & Mentorship", "ACT_TRAIN", "Training", "Classroom and virtual instruction"),
            ("Curriculum & Content Creation", "ACT_CURR", "Training", "Lesson plans, presentations, exercises"),
            ("Placement Coordination & Outreach", "ACT_PLACE", "Corporate Placement", "Employer meetings and candidate scheduling"),
            ("Accessibility Auditing & QA", "ACT_A11Y", "Technical", "NVDA/JAWS screen reader testing and WCAG evaluation"),
            ("Internal Meetings & Administration", "ACT_MEET", "General", "Team standups and sync meetings"),
        ]

        activity_types = []
        for at_name, code, cat, desc in act_types_seed:
            act_t = DSRActivityType(
                public_id=uuid.uuid4(),
                name=at_name,
                code=code,
                category=cat,
                description=desc,
                is_active=True,
                is_deleted=False,
            )
            session.add(act_t)
            activity_types.append(act_t)

        await session.flush()

        # Activities with active date ranges covering TODAY and entire year!
        activities_seed = [
            (projects[0].id, "Conduct Daily Technical Training Sessions", "Classroom and lab hands-on coding sessions for cohort"),
            (projects[0].id, "Evaluate Weekly Practical Assignments", "Review candidate GitHub PRs and provide personalized feedback"),
            (projects[1].id, "Audit Web Applications for WCAG 2.1 Compliance", "Screen reader (NVDA/JAWS) testing of client software portals"),
            (projects[2].id, "Deliver Workplace Inclusion & Sensitivity Workshops", "Corporate trainer training for HR and engineering leads"),
        ]

        activities = []
        for pid, name, desc in activities_seed:
            act = DSRActivity(
                public_id=uuid.uuid4(),
                project_id=pid,
                name=name,
                description=desc,
                start_date=date(2026, 1, 1),
                end_date=date(2026, 12, 31),
                status=DSRActivityStatus.IN_PROGRESS,
                is_active=True,
                is_deleted=False,
            )
            session.add(act)
            activities.append(act)

        await session.flush()

        # CRUCIAL: Assign ALL active staff users to these activities so the activity dropdown in DSR submission modal POPULATES!
        for act in activities:
            for u in all_users:
                await session.execute(
                    activity_assignments.insert().values(activity_id=act.id, user_id=u.id)
                )

        await session.flush()
        print("  -> Assigned all active staff users to project activities in dsr_activity_assignments.")

        # DSR Timesheet Entries for recent days and TODAY!
        for d in range(5):
            entry_date = today - timedelta(days=d)
            p = projects[d % len(projects)]
            a = activities[d % len(activities)]
            session.add(DSREntry(
                public_id=uuid.uuid4(),
                user_id=admin_id,
                report_date=entry_date,
                status=DSRStatus.APPROVED if d > 0 else DSRStatus.SUBMITTED,
                is_leave=False,
                is_previous_day_submission=False,
                items=[{
                    "project_public_id": str(p.public_id),
                    "activity_public_id": str(a.public_id),
                    "description": f"Executed scheduled core project deliverable and candidate mentoring sessions for {entry_date.strftime('%B %d')}.",
                    "start_time": "09:30",
                    "end_time": "17:30",
                    "hours": 8.0
                }],
                is_deleted=False,
            ))

        # Company Holidays
        holidays_seed = [
            (date(2026, 1, 1), "New Year's Day"),
            (date(2026, 1, 15), "Pongal / Makara Sankranti"),
            (date(2026, 1, 26), "Republic Day"),
            (date(2026, 3, 30), "Ugadi / Gudi Padwa"),
            (date(2026, 5, 1), "May Day"),
            (date(2026, 8, 15), "Independence Day"),
            (date(2026, 10, 2), "Gandhi Jayanti"),
        ]

        for h_date, h_name in holidays_seed:
            session.add(CompanyHoliday(
                public_id=uuid.uuid4(),
                holiday_date=h_date,
                holiday_name=h_name,
                created_by_id=admin_id,
                is_deleted=False,
            ))

        await session.flush()
        print(f"  -> Created {len(projects)} projects, {len(activity_types)} activity types, {len(activities)} activities, timesheets, and {len(holidays_seed)} company holidays.")

        # -------------------------------------------------------------
        # 9. SUPPORT TICKETS & MESSAGES
        # -------------------------------------------------------------
        print("\n[9/9] Seeding Support Tickets & Messages...")
        tickets_seed = [
            ("TICK-2026-001", "Request for Screen Magnifier Hardware (Low Vision Lab)", TicketCategory.TECHNICAL, TicketPriority.HIGH, TicketStatus.OPEN, "Lab 2 requires two 27-inch monitors and screen magnifying software for low vision students."),
            ("TICK-2026-002", "Accessibility Testing Suite License Renewal", TicketCategory.TECHNICAL, TicketPriority.MEDIUM, TicketStatus.IN_PROGRESS, "Renew JAWS and NVDA accessibility testing commercial add-ons for the QA cohort."),
            ("TICK-2026-003", "Portal Navigation Assistance & Account Config", TicketCategory.ACCOUNT, TicketPriority.LOW, TicketStatus.RESOLVED, "Routine password reset and dashboard role setup for newly registered trainer."),
        ]

        for t_no, title, cat, prio, stat, desc in tickets_seed:
            t = Ticket(
                ticket_number=t_no,
                title=title,
                user_id=admin_id,
                category=cat,
                priority=prio,
                status=stat,
                description=desc,
                is_deleted=False,
            )
            session.add(t)
            await session.flush()

            session.add(TicketMessage(
                ticket_id=t.id,
                user_id=admin_id,
                message=f"Ticket initialized: {desc}",
                is_deleted=False,
            ))

        await session.commit()
        print(f"  -> Created {len(tickets_seed)} support tickets and message threads.")

    await engine.dispose()
    print("\n" + "=" * 75)
    print("SUCCESS: Dev environment database completely seeded with rich, verified demo data!")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(seed_dev_demo_data())
