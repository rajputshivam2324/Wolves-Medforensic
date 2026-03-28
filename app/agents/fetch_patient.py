from sqlalchemy import select
from ..db.neon import AsyncSessionLocal
from ..db.models import Patient


async def run(state):
    """Fetch patient record from NeonDB by patient_id."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Patient).where(Patient.patient_id == state["patient_id"])
        )
        patient = result.scalar_one_or_none()

    if patient:
        return {"patient_record": patient.record}
    else:
        return {"patient_record": {"error": f"Patient {state['patient_id']} not found"}}
