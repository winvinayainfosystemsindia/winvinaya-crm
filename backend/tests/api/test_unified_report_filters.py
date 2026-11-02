import pytest
from app.services.unified_report_service import UnifiedReportService
from app.models.candidate import Candidate

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
