"""Consistent, safe HTTP responses for authentication and Supabase failures."""

import logging

import httpx
from fastapi import HTTPException
from postgrest.exceptions import APIError
from storage3.utils import StorageException
from supabase_auth.errors import (
    AuthApiError,
    AuthInvalidCredentialsError,
    AuthInvalidJwtError,
    AuthRetryableError,
    AuthSessionMissingError,
    AuthUnknownError,
)

logger = logging.getLogger(__name__)

INVALID_CREDENTIAL_ERRORS = (
    AuthInvalidCredentialsError,
    AuthInvalidJwtError,
    AuthSessionMissingError,
)
UPSTREAM_ERRORS = (APIError, StorageException, httpx.HTTPError, AuthRetryableError, AuthUnknownError)


def _log_exception(message: str, exc: Exception) -> None:
    logger.error(message, exc_info=(type(exc), exc, exc.__traceback__))


def authentication_http_error(exc: Exception, *, project_id: str | None = None) -> HTTPException:
    """Map only confirmed credential rejections to 401; log other failures."""
    if isinstance(exc, HTTPException):
        return exc
    if isinstance(exc, INVALID_CREDENTIAL_ERRORS) or (
        isinstance(exc, AuthApiError) and exc.status == 401
    ):
        logger.warning("Supabase rejected project authentication for %s", project_id)
        return HTTPException(401, "Sign in to access this project.", headers={"Cache-Control": "no-store"})
    if isinstance(exc, AuthApiError):
        _log_exception(f"Supabase authentication service failed for project {project_id}", exc)
        status = 503 if exc.status >= 500 or exc.status == 429 else 502
        return HTTPException(status, "Authentication service is unavailable. Please try again.", headers={"Cache-Control": "no-store"})
    if isinstance(exc, AuthRetryableError):
        _log_exception(f"Supabase authentication service is temporarily unavailable for project {project_id}", exc)
        return HTTPException(503, "Authentication service is unavailable. Please try again.", headers={"Cache-Control": "no-store"})
    if isinstance(exc, AuthUnknownError):
        _log_exception(f"Supabase returned an unexpected authentication error for project {project_id}", exc)
        return HTTPException(502, "Unable to verify project access. Please try again.", headers={"Cache-Control": "no-store"})
    if isinstance(exc, UPSTREAM_ERRORS):
        _log_exception(f"Supabase authentication request failed for project {project_id}", exc)
        return HTTPException(502, "Unable to verify project access. Please try again.", headers={"Cache-Control": "no-store"})
    _log_exception(f"Unexpected project authentication failure for {project_id}", exc)
    return HTTPException(500, "Unable to verify project access.", headers={"Cache-Control": "no-store"})


def upstream_http_error(exc: Exception, *, operation: str, project_id: str | None = None) -> HTTPException:
    """Map known upstream failures separately from unexpected backend errors."""
    if isinstance(exc, HTTPException):
        return exc
    if isinstance(exc, UPSTREAM_ERRORS):
        _log_exception(f"{operation} failed for project {project_id}", exc)
        status = getattr(exc, "status", None)
        http_status = 503 if status == 429 or (status is not None and status >= 500) else 502
        return HTTPException(http_status, "The requested service is unavailable. Please try again.", headers={"Cache-Control": "no-store"})
    _log_exception(f"Unexpected backend failure during {operation} for project {project_id}", exc)
    return HTTPException(500, "The request could not be completed.", headers={"Cache-Control": "no-store"})
