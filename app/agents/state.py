from typing import TypedDict, Optional


class ForensicsState(TypedDict):
    session_id: str
    patient_id: str
    llm_output: str
    patient_record: dict
    extracted_claims: list[dict]       # [{claim_text, claim_type, entities}]
    contradiction_result: dict         # {score, flags, evidence}
    citation_result: dict              # {score, flags, evidence}
    outlier_result: dict               # {score, flags, evidence}
    calibrator_result: dict            # {score, flags, evidence}
    risk_score: float
    risk_level: str                    # "PASS" | "WARN" | "HOLD"
    final_flags: list[dict]
    rewritten_output: Optional[str]
    should_rewrite: bool
