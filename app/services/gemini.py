from google import genai
from ..core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL = "gemini-2.5-flash"


from .stream import sse_queues

async def call_gemini(prompt: str, session_id: str | None = None, node_name: str | None = None) -> str:
    """Call Gemini 2.5 Flash. Optionally stream to an SSE queue if session_id and node_name are provided."""
    if session_id and node_name and session_id in sse_queues:
        queue = sse_queues[session_id]
        response = await client.aio.models.generate_content_stream(
            model=MODEL,
            contents=prompt,
        )
        full_text = ""
        async for chunk in response:
            full_text += chunk.text
            await queue.put({"node": node_name, "type": "stream", "chunk": chunk.text})
        return full_text
    else:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=prompt,
        )
        return response.text
