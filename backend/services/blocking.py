"""Join request-owned blocking work before cancellation cleanup can run."""
import asyncio
from functools import partial
import anyio


async def run_blocking(function, *args, **kwargs):
    # Starlette cancels through AnyIO scopes. Shield this individual operation,
    # not the entire processing request, so uploads cannot outlive cleanup.
    with anyio.CancelScope(shield=True):
        task = asyncio.create_task(asyncio.to_thread(partial(function, *args, **kwargs)))
        try:
            return await asyncio.shield(task)
        except asyncio.CancelledError:
            # Also handle direct asyncio cancellation (outside an AnyIO scope).
            try:
                await asyncio.shield(task)
            finally:
                raise
