"""HTTP/SSE representation for processing events."""

import json
from collections.abc import AsyncIterator

from fastapi.sse import ServerSentEvent


ProcessingEvent = tuple[str, dict]


def serialize_sse_event(event: ServerSentEvent) -> str:
    """Convert a ServerSentEvent to the SSE wire format."""
    lines: list[str] = []

    if event.comment:
        lines.append(f": {event.comment}")
    if event.event:
        lines.append(f"event: {event.event}")
    if event.id:
        lines.append(f"id: {event.id}")
    if event.retry:
        lines.append(f"retry: {event.retry}")
    if event.data is not None:
        lines.append(f"data: {json.dumps(event.data)}")
    elif event.raw_data:
        lines.append(f"data: {event.raw_data}")

    return "\n".join(lines) + "\n\n"


async def stream_sse_events(events: AsyncIterator[ProcessingEvent]) -> AsyncIterator[str]:
    """Turn service-level events into serialized SSE messages."""
    async for event_name, data in events:
        yield serialize_sse_event(ServerSentEvent(event=event_name, data=data))
