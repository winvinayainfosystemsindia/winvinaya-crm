import pytest
from datetime import datetime
from app.services.unified_report_service import UnifiedReportService
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_counseling import CandidateCounseling
from app.models.training_batch import TrainingBatch
from app.models.training_candidate_allocation import TrainingCandidateAllocation

@pytest.mark.asyncio
async def test_unified_report_multiple_filters(db_session):
    # Create sample candidates
    c1 = Candidate(
        name="John Doe",
        gender="Male",
        email="john@example.com",
        phone="9876543210",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        is_deleted=False
    )
    c2 = Candidate(
        name="Jane Smith",
        gender="Female",
        email="jane@example.com",
        phone="9876543211",
        pincode="600002",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        is_deleted=False
    )
    c3 = Candidate(
        name="Bob Wilson",
        gender="Male",
        email="bob@example.com",
        phone="9876543212",
        pincode="560001",
        city="Bangalore",
        district="Bangalore",
        state="Karnataka",
        is_deleted=False
    )
    for c in [c1, c2, c3]:
        db_session.add(c)
        await db_session.flush()
    await db_session.commit()

    service = UnifiedReportService(db_session)

    # 1. Single filter: gender=Male
    res_male = await service.get_report(gender="male")
    assert res_male["total"] == 2
    male_names = {c["name"] for c in res_male["items"]}
    assert male_names == {"John Doe", "Bob Wilson"}

    # 2. Single filter: city=Chennai
    res_chennai = await service.get_report(cities="Chennai")
    assert res_chennai["total"] == 2
    chennai_names = {c["name"] for c in res_chennai["items"]}
    assert chennai_names == {"John Doe", "Jane Smith"}

    # 3. Multiple filters: gender=Male AND city=Chennai
    res_multi = await service.get_report(gender="male", cities="Chennai")
    assert res_multi["total"] == 1
    assert res_multi["items"][0]["name"] == "John Doe"

    # 4. Multiple filters with no match: gender=Female AND city=Bangalore
    res_none = await service.get_report(gender="female", cities="Bangalore")
    assert res_none["total"] == 0


@pytest.mark.asyncio
async def test_unified_report_female_non_pwd_and_women(db_session):
    # Candidate 1: Female, Non-PwD (is_disabled=False, disability_type="")
    f_non_pwd = Candidate(
        name="Priya Sharma",
        gender="Female",
        email="priya@example.com",
        phone="9876543221",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        disability_details={"is_disabled": False, "disability_type": "", "disability_percentage": 0.0},
        is_deleted=False
    )
    # Candidate 2: Female, PwD (Locomotor Disability)
    f_pwd = Candidate(
        name="Anitha Devi",
        gender="Female",
        email="anitha@example.com",
        phone="9876543222",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        disability_details={"is_disabled": True, "disability_type": "Locomotor Disability", "disability_percentage": 50.0},
        is_deleted=False
    )
    # Candidate 3: Chose "Women" in disability category
    cand_women = Candidate(
        name="Lakshmi Narayanan",
        gender="Female",
        email="lakshmi@example.com",
        phone="9876543223",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        disability_details={"is_disabled": True, "disability_type": "Women"},
        is_deleted=False
    )
    # Candidate 4: Male, Non-PwD
    m_non_pwd = Candidate(
        name="Ramesh Kumar",
        gender="Male",
        email="ramesh@example.com",
        phone="9876543224",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        disability_details={"is_disabled": False, "disability_type": ""},
        is_deleted=False
    )
    # Candidate 5: Female, Non-PwD with disability_details=None
    f_none_details = Candidate(
        name="Kavitha Mani",
        gender="Female",
        email="kavitha@example.com",
        phone="9876543225",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        disability_details=None,
        is_deleted=False
    )

    for c in [f_non_pwd, f_pwd, cand_women, m_non_pwd, f_none_details]:
        db_session.add(c)
        await db_session.flush()
    await db_session.commit()

    service = UnifiedReportService(db_session)

    # 1. Filter: Gender = Female AND Disability = Non-PwD
    # Should return Priya, Lakshmi (chose Women), and Kavitha (None details).
    # Should NOT return Anitha (PwD Locomotor) or Ramesh (Male).
    res_female_non_pwd = await service.get_report(gender="female", disability_types="Non-PwD")
    names = {c["name"] for c in res_female_non_pwd["items"]}
    assert "Priya Sharma" in names
    assert "Lakshmi Narayanan" in names
    assert "Kavitha Mani" in names
    assert "Anitha Devi" not in names
    assert "Ramesh Kumar" not in names

    # 2. Filter: Disability = Women
    # Should consider candidates who chose Women in disability category as well as female Non-PwD
    res_women_cat = await service.get_report(disability_types="Women")
    women_names = {c["name"] for c in res_women_cat["items"]}
    assert "Lakshmi Narayanan" in women_names
    assert "Priya Sharma" in women_names
    assert "Kavitha Mani" in women_names
    assert "Anitha Devi" not in women_names
    assert "Ramesh Kumar" not in women_names

    # 3. Serialization checks:
    item_priya = next(c for c in res_female_non_pwd["items"] if c["name"] == "Priya Sharma")
    assert item_priya["disability_type"] == "Non-PwD"
    assert item_priya["gender"] == "Female"

    item_lakshmi = next(c for c in res_female_non_pwd["items"] if c["name"] == "Lakshmi Narayanan")
    assert item_lakshmi["disability_type"] == "Women"
    assert item_lakshmi["gender"] == "Female"

    item_kavitha = next(c for c in res_female_non_pwd["items"] if c["name"] == "Kavitha Mani")
    assert item_kavitha["disability_type"] == "Non-PwD"


@pytest.mark.asyncio
async def test_unified_report_screening_counseling_selected_unallocated(db_session):
    # Create batch
    batch = TrainingBatch(
        batch_name="Batch Alpha",
        status="in_progress",
        is_deleted=False
    )
    db_session.add(batch)
    await db_session.flush()

    # Candidate 1: Screening "Completed", Counseling "selected", Unallocated (NO allocation) -> MATCHES
    c1 = Candidate(
        name="Candidate One",
        gender="Female",
        email="c1@example.com",
        phone="9876543231",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        is_deleted=False
    )
    # Candidate 2: Screening "selected", Counseling "selected", Unallocated (NO allocation) -> MATCHES
    c2 = Candidate(
        name="Candidate Two",
        gender="Male",
        email="c2@example.com",
        phone="9876543232",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        is_deleted=False
    )
    # Candidate 3: Screening "Completed", Counseling "selected", ALLOCATED to Batch Alpha -> EXCLUDED
    c3 = Candidate(
        name="Candidate Three",
        gender="Female",
        email="c3@example.com",
        phone="9876543233",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        is_deleted=False
    )
    # Candidate 4: Screening "Completed", Counseling "selected", COMPLETED TRAINING in Batch Alpha -> EXCLUDED
    c4 = Candidate(
        name="Candidate Four",
        gender="Male",
        email="c4@example.com",
        phone="9876543234",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        is_deleted=False
    )
    # Candidate 5: Screening "Pending", Counseling "selected", Unallocated -> EXCLUDED
    c5 = Candidate(
        name="Candidate Five",
        gender="Female",
        email="c5@example.com",
        phone="9876543235",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        is_deleted=False
    )
    # Candidate 6: Screening "Completed", Counseling "rejected", Unallocated -> EXCLUDED
    c6 = Candidate(
        name="Candidate Six",
        gender="Male",
        email="c6@example.com",
        phone="9876543236",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        is_deleted=False
    )

    for cand in [c1, c2, c3, c4, c5, c6]:
        db_session.add(cand)
        await db_session.flush()

    # Add Screenings
    s1 = CandidateScreening(candidate_id=c1.id, status="Completed")
    s2 = CandidateScreening(candidate_id=c2.id, status="selected")
    s3 = CandidateScreening(candidate_id=c3.id, status="Completed")
    s4 = CandidateScreening(candidate_id=c4.id, status="Completed")
    s5 = CandidateScreening(candidate_id=c5.id, status="pending")
    s6 = CandidateScreening(candidate_id=c6.id, status="Completed")

    # Add Counselings
    cn1 = CandidateCounseling(candidate_id=c1.id, status="selected")
    cn2 = CandidateCounseling(candidate_id=c2.id, status="selected")
    cn3 = CandidateCounseling(candidate_id=c3.id, status="selected")
    cn4 = CandidateCounseling(candidate_id=c4.id, status="selected")
    cn5 = CandidateCounseling(candidate_id=c5.id, status="selected")
    cn6 = CandidateCounseling(candidate_id=c6.id, status="rejected")

    for obj in [s1, s2, s3, s4, s5, s6, cn1, cn2, cn3, cn4, cn5, cn6]:
        db_session.add(obj)
        await db_session.flush()

    # Add Allocations
    alloc3 = TrainingCandidateAllocation(
        candidate_id=c3.id,
        batch_id=batch.id,
        status="allocated",
        is_dropout=False,
        is_deleted=False
    )
    alloc4 = TrainingCandidateAllocation(
        candidate_id=c4.id,
        batch_id=batch.id,
        status="completed",
        is_dropout=False,
        is_deleted=False
    )
    db_session.add(alloc3)
    db_session.add(alloc4)
    await db_session.flush()
    await db_session.commit()

    service = UnifiedReportService(db_session)

    # 1. Filter: screening_status="selected", counseling_status="selected", is_allocated=False
    res_unalloc = await service.get_report(
        screening_status="selected",
        counseling_status="selected",
        is_allocated=False
    )
    names = {c["name"] for c in res_unalloc["items"]}
    assert "Candidate One" in names
    assert "Candidate Two" in names
    assert "Candidate Three" not in names  # currently allocated
    assert "Candidate Four" not in names   # already completed training
    assert "Candidate Five" not in names   # pending screening
    assert "Candidate Six" not in names    # rejected counseling

    # 2. Filter: screening_status="Completed", counseling_status="selected", training_status="unallocated"
    res_unalloc_status = await service.get_report(
        screening_status="Completed",
        counseling_status="selected",
        training_status="unallocated"
    )
    names_status = {c["name"] for c in res_unalloc_status["items"]}
    assert "Candidate One" in names_status
    assert "Candidate Two" in names_status
    assert "Candidate Three" not in names_status
    assert "Candidate Four" not in names_status
    assert "Candidate Five" not in names_status
    assert "Candidate Six" not in names_status

    # 3. Check is_allocated flag in serialized items
    item_c1 = next(c for c in res_unalloc["items"] if c["name"] == "Candidate One")
    assert item_c1["is_allocated"] is False


@pytest.mark.asyncio
async def test_unified_report_registration_date_filters(db_session):
    c_jan = Candidate(
        name="Jan Candidate",
        gender="Female",
        email="jan@example.com",
        phone="9876543241",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        created_at=datetime(2026, 1, 15, 10, 0, 0),
        is_deleted=False
    )
    c_feb = Candidate(
        name="Feb Candidate",
        gender="Male",
        email="feb@example.com",
        phone="9876543242",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        created_at=datetime(2026, 2, 15, 14, 30, 0),
        is_deleted=False
    )
    c_mar = Candidate(
        name="Mar Candidate",
        gender="Female",
        email="mar@example.com",
        phone="9876543243",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        created_at=datetime(2026, 3, 15, 9, 15, 0),
        is_deleted=False
    )

    for c in [c_jan, c_feb, c_mar]:
        db_session.add(c)
        await db_session.flush()
    await db_session.commit()

    service = UnifiedReportService(db_session)

    # 1. Range filter covering February only
    res_feb = await service.get_report(created_from="2026-02-01", created_to="2026-02-28")
    feb_names = {c["name"] for c in res_feb["items"]}
    assert "Feb Candidate" in feb_names
    assert "Jan Candidate" not in feb_names
    assert "Mar Candidate" not in feb_names

    # 2. Filter from Feb onwards
    res_from_feb = await service.get_report(created_from="2026-02-01")
    from_feb_names = {c["name"] for c in res_from_feb["items"]}
    assert "Feb Candidate" in from_feb_names
    assert "Mar Candidate" in from_feb_names
    assert "Jan Candidate" not in from_feb_names

    # 3. Filter up to Feb
    res_to_feb = await service.get_report(created_to="2026-02-28")
    to_feb_names = {c["name"] for c in res_to_feb["items"]}
    assert "Jan Candidate" in to_feb_names
    assert "Feb Candidate" in to_feb_names
    assert "Mar Candidate" not in to_feb_names


