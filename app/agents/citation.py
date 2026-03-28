from ..services.rag import query_drug_labels
from ..services.gemini import call_gemini
import json

PROMPT = """
You are a clinical pharmacology verifier. Given drug label excerpts retrieved from a database and a set of clinical claims, check if the claims are supported, unsupported, or contradicted by the drug label evidence.

Retrieved drug label excerpts:
{rag_chunks}

Claims:
{claims}

Respond by FIRST providing a step-by-step reasoning or thought process, reflecting on the evidence.
THEN, respond with the final JSON enclosed in ```json ... ``` tags:
{{
  "score": 0.0-1.0,
  "flags": [
    {{"claim": "...", "verdict": "SUPPORTED|UNSUPPORTED|CONTRADICTED", "reason": "...", "source": "..."}}
  ],
  "evidence": "summary"
}}

Score guidelines:
- 0.0: All claims supported by drug labels
- 0.3-0.5: Some claims unsupported but not dangerous
- 0.7-1.0: Claims directly contradicted by FDA drug label data (e.g. dosing outside approved ranges, ignoring black box warnings)
"""


async def run(state):
    """Agent 2: Verify claims against drug labels via ChromaDB RAG + Gemini."""
    # Build query from entities in claims
    drug_entities = [e for c in state["extracted_claims"] for e in c.get("entities", [])]
    query = " ".join(drug_entities) if drug_entities else state["llm_output"][:200]
    chunks = await query_drug_labels(query, n_results=5)

    prompt = PROMPT.format(
        rag_chunks=json.dumps(chunks, indent=2),
        claims=json.dumps(state["extracted_claims"], indent=2),
    )
    raw = await call_gemini(
        prompt, 
        session_id=state.get("session_id"), 
        node_name="run_citation"
    )
    
    # Extract JSON block
    json_start = raw.find("```json")
    if json_start != -1:
        json_end = raw.rfind("```")
        cleaned = raw[json_start + 7:json_end].strip()
    else:
        cleaned = raw.strip()
        
    result = json.loads(cleaned)
    return {"citation_result": result}
