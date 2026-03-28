from ..services.gemini import call_gemini
import json

PROMPT = """
You are a clinical outlier detection system. Given a patient's demographics, vitals, labs, and comorbidities, check if the AI's clinical claims are statistically unusual or clinically inappropriate for this patient profile.

Patient record:
{patient_record}

Claims:
{claims}

Flag claims where: dosages are outside standard ranges for the patient's age/weight/renal function, diagnoses are implausible given labs, or treatments are atypical for the condition.

Respond by FIRST providing a step-by-step reasoning or thought process, reflecting on the patient profile.
THEN, respond with the final JSON enclosed in ```json ... ``` tags:
{{
  "score": 0.0-1.0,
  "flags": [
    {{"claim": "...", "outlier_type": "DOSE|DIAGNOSIS|TREATMENT", "reason": "...", "severity": "HIGH|MEDIUM|LOW"}}
  ],
  "evidence": "summary"
}}

Score guidelines:
- 0.0: All claims clinically appropriate for this patient
- 0.3-0.5: Minor dose or treatment variations
- 0.7-1.0: Dangerous outliers (e.g. full dose in renal failure, implausible diagnosis given labs)
"""


async def run(state):
    """Agent 3: Check for clinical outliers given patient demographics and labs."""
    prompt = PROMPT.format(
        patient_record=json.dumps(state["patient_record"], indent=2),
        claims=json.dumps(state["extracted_claims"], indent=2),
    )
    raw = await call_gemini(
        prompt, 
        session_id=state.get("session_id"), 
        node_name="run_outlier"
    )
    
    # Extract JSON block
    json_start = raw.find("```json")
    if json_start != -1:
        json_end = raw.rfind("```")
        cleaned = raw[json_start + 7:json_end].strip()
    else:
        cleaned = raw.strip()
        
    result = json.loads(cleaned)
    return {"outlier_result": result}
