import asyncio
from typing import Dict

# Global dictionary to map session IDs to their SSE queues.
# This avoids circular imports between the API routes and background agent tasks.
sse_queues: Dict[str, asyncio.Queue] = {}
