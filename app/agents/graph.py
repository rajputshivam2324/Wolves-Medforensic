from langgraph.graph import StateGraph, END
from langgraph.constants import Send
from .state import ForensicsState
from . import extract_claims, fetch_patient, contradiction, citation, outlier, calibrator
from ..utils.scoring import aggregate_risk
from ..services.rewriter import maybe_rewrite


def build_graph():
    graph = StateGraph(ForensicsState)

    graph.add_node("extract_claims", extract_claims.run)
    graph.add_node("fetch_patient", fetch_patient.run)
    graph.add_node("run_contradiction", contradiction.run)
    graph.add_node("run_citation", citation.run)
    graph.add_node("run_outlier", outlier.run)
    graph.add_node("run_calibrator", calibrator.run)
    graph.add_node("aggregate_risk", aggregate_risk)
    graph.add_node("maybe_rewrite", maybe_rewrite)

    graph.set_entry_point("extract_claims")
    graph.add_edge("extract_claims", "fetch_patient")

    # Fan-out: after fetch_patient, fire all 4 agents in parallel via Send()
    def fan_out(state: ForensicsState):
        return [
            Send("run_contradiction", {**state}),
            Send("run_citation", {**state}),
            Send("run_outlier", {**state}),
            Send("run_calibrator", {**state}),
        ]

    graph.add_conditional_edges("fetch_patient", fan_out)

    # All 4 feed into aggregate_risk (LangGraph waits for all)
    for agent_node in ["run_contradiction", "run_citation", "run_outlier", "run_calibrator"]:
        graph.add_edge(agent_node, "aggregate_risk")

    graph.add_edge("aggregate_risk", "maybe_rewrite")
    graph.add_edge("maybe_rewrite", END)

    return graph.compile()
