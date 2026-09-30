"""Request-lifetime exclusion for the current single-process MVP server.

Multi-worker deployments need a database-backed claim before enabling writes.
"""
from contextlib import contextmanager
from threading import Lock

_guard = Lock()
_active: set[str] = set()


class ProjectBusy(Exception):
    pass


@contextmanager
def project_operation(project_id: str):
    with _guard:
        if project_id in _active:
            raise ProjectBusy('A project operation is already running')
        _active.add(project_id)
    try:
        yield
    finally:
        with _guard:
            _active.remove(project_id)
