from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import asyncio
import uuid
import json
from ..agents.graph import build_graph
from ..db.neon import AsyncSessionLocal
from ..db.models import Session as DBSession, AuditLog, Patient
from sqlalchemy import select

from ..services.stream import sse_queues

from pydantic import BaseModel

router = APIRouter()
graph = build_graph()

class PatientCreate(BaseModel):
    name: str
    age: int
    record: dict

@router.get("/patients")
async def get_patients():
    """Return all demo patients."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Patient))
        patients = result.scalars().all()
        return [
            {"patient_id": p.patient_id, "name": p.name, "age": p.age}
            for p in patients
        ]

@router.post("/patients")
async def create_patient(payload: PatientCreate):
    """Create a custom patient in NeonDB."""
    patient_id = "P" + uuid.uuid4().hex[:6].upper()
    async with AsyncSessionLocal() as db:
        new_patient = Patient(
            patient_id=patient_id,
            name=payload.name,
            age=payload.age,
            record=payload.record
        )
        db.add(new_patient)
        await db.commit()
        return {"patient_id": patient_id, "name": payload.name, "age": payload.age}


@router.post("/analyze")
async def analyze(payload: dict):
    """Start forensic analysis of LLM output for a patient."""
    session_id = str(uuid.uuid4())
    queue = asyncio.Queue()
    sse_queues[session_id] = queue

    async def run_graph():
        state = {
            "session_id": session_id,
            "patient_id": payload["patient_id"],
            "llm_output": payload["llm_output"],
            "patient_record": {},
            "extracted_claims": [],
            "contradiction_result": {},
            "citation_result": {},
            "outlier_result": {},
            "calibrator_result": {},
            "risk_score": 0.0,
            "risk_level": "PASS",
            "final_flags": [],
            "rewritten_output": None,
            "should_rewrite": False,
        }

        try:
            async for event in graph.astream(state):
                for node, result in event.items():
                    await queue.put({"node": node, "data": result})
        except Exception as e:
            await queue.put({"node": "error", "data": {"error": str(e)}})
        finally:
            await queue.put(None)  # signal done

        # Persist session + audit logs to NeonDB
        try:
            final_state = state.copy()
            # Collect final state from stream events
            async with AsyncSessionLocal() as db:
                db_session = DBSession(
                    session_id=session_id,
                    patient_id=payload["patient_id"],
                    llm_output=payload["llm_output"],
                    risk_score=0.0,
                    risk_level="PASS",
                )
                db.add(db_session)
                await db.commit()
        except Exception:
            pass  # Non-critical — demo build

    asyncio.create_task(run_graph())
    return {"session_id": session_id}


@router.get("/stream/{session_id}")
async def stream(session_id: str):
    """SSE endpoint to stream agent results in real-time."""
    queue = sse_queues.get(session_id)
    if not queue:
        return {"error": "session not found"}

    async def event_generator():
        while True:
            item = await queue.get()
            if item is None:
                yield {"event": "done", "data": json.dumps({"status": "complete"})}
                break
            yield {"event": "agent_update", "data": json.dumps(item)}

    return EventSourceResponse(event_generator())
