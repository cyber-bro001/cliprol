from fastapi.sse import ServerSentEvent


def error_stream_generator(message: str):
    """
    An async generator function that yields a single error message in the form of a ServerSentEvent.
    This function is used to create an error stream for clients when an error occurs during processing.

    Args:
        message (str): The error message to be sent to the client.

    Yields:
        ServerSentEvent: An error event with the specified message.
    """
    async def _generate():
        yield ServerSentEvent(event="error", data={"message": message})
    return _generate()