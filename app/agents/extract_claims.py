from ..services.gemini import call_gemini
import json

PROMPT = """
You are a clinical NLP system. Extract all factual clinical claims from this AI-generated clinical text.

Text:
{llm_output}

For each claim, identify:
- The claim text (the exact or near-exact statement from the text)
- Claim type: DIAGNOSIS | DRUG_DOSE | PROCEDURE | PROGNOSIS | LAB_INTERPRETATION
- Named entities (drug names, dosages, diagnoses, lab values)

Respond ONLY with JSON (no markdown fencing):
{{
  "claims": [
    {{"claim_text": "...", "claim_type": "...", "entities": ["...", "..."]}}
  ]
}}
"""


async def run(state):
    """Extract structured claims from the LLM output using Gemini."""
    prompt = PROMPT.format(llm_output=state["llm_output"])
    raw = await call_gemini(prompt)
    cleaned = raw.strip().strip("```json").strip("```").strip()
    parsed = json.loads(cleaned)
    return {"extracted_claims": parsed["claims"]}
