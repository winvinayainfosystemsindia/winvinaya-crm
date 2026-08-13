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
