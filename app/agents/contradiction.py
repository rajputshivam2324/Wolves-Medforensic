from ..services.gemini import call_gemini
import json

PROMPT = """
You are a clinical NLI system. Given a patient record and a list of clinical claims from an AI output, identify any contradictions.

Patient record:
{patient_record}

Claims to check:
{claims}

For each claim, determine if it CONTRADICTS, is NEUTRAL to, or is ENTAILED BY the patient record.
Focus on: allergies vs prescribed drugs, contraindicated conditions, wrong dosages for organ function.

Respond by FIRST providing a step-by-step reasoning or thought process, reflecting on each claim.
THEN, respond with the final JSON enclosed in ```json ... ``` tags:
{{
  "score": 0.0-1.0,
  "flags": [
    {{"claim": "...", "verdict": "CONTRADICTION|NEUTRAL|ENTAILED", "reason": "...", "severity": "HIGH|MEDIUM|LOW"}}
  ],
  "evidence": "summary of findings"
}}

Score guidelines:
- 0.0: No contradictions found
- 0.3-0.5: Minor discrepancies or neutral findings
- 0.7-1.0: Direct contradictions with patient safety implications (e.g. prescribing allergens, ignoring organ failure)
"""


async def run(state):
    """Agent 1: Check for contradictions between claims and patient record."""
    prompt = PROMPT.format(
        patient_record=json.dumps(state["patient_record"], indent=2),
        claims=json.dumps(state["extracted_claims"], indent=2),
    )
    raw = await call_gemini(
        prompt, 
        session_id=state.get("session_id"), 
        node_name="run_contradiction"
    )
    
    # Extract JSON block
    json_start = raw.find("```json")
    if json_start != -1:
        json_end = raw.rfind("```")
        cleaned = raw[json_start + 7:json_end].strip()
    else:
        cleaned = raw.strip()
        
    result = json.loads(cleaned)
    return {"contradiction_result": result}
