WEIGHTS = {
    "contradiction": 0.40,   # highest — allergy/contraindication is patient-safety critical
    "citation": 0.25,
    "outlier": 0.20,
    "calibrator": 0.15,
}


async def aggregate_risk(state):
    """Compute weighted risk score from all 4 agent results."""
    score = (
        state["contradiction_result"].get("score", 0) * WEIGHTS["contradiction"]
        + state["citation_result"].get("score", 0) * WEIGHTS["citation"]
        + state["outlier_result"].get("score", 0) * WEIGHTS["outlier"]
        + state["calibrator_result"].get("score", 0) * WEIGHTS["calibrator"]
    )

    all_flags = (
        state["contradiction_result"].get("flags", [])
        + state["citation_result"].get("flags", [])
        + state["outlier_result"].get("flags", [])
        + state["calibrator_result"].get("flags", [])
    )

    risk_level = "PASS" if score < 0.4 else "WARN" if score < 0.7 else "HOLD"

    return {
        "risk_score": round(score, 3),
        "risk_level": risk_level,
        "final_flags": all_flags,
        "should_rewrite": score >= 0.7,
    }
