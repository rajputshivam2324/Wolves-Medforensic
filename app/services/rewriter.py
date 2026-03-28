from .gemini import call_gemini
import json

PROMPT = """
You are a clinical safety editor. The following AI-generated clinical text has been flagged for hallucinations or dangerous content.

Original text:
{llm_output}

Flags identified:
{flags}

Rewrite the text to: remove or hedge the flagged claims, add appropriate uncertainty language, and preserve all safe content.
Do NOT add new clinical recommendations. Only make it safer.

Return ONLY the rewritten clinical text — no JSON, no preamble.
"""


async def maybe_rewrite(state):
    """Rewrite the LLM output if risk score warrants it."""
    if not state.get("should_rewrite"):
        return {"rewritten_output": None}

    prompt = PROMPT.format(
        llm_output=state["llm_output"],
        flags=json.dumps(state.get("final_flags", []), indent=2),
    )
    rewritten = await call_gemini(prompt)
    return {"rewritten_output": rewritten.strip()}
