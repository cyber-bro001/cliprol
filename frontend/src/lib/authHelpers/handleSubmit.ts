import type { FormEvent } from "react";
import type { userCrediantailsType } from "../../types";
import { validateForm, type FormErrors } from "./validateForm";

type SubmitResult = {
  success: boolean;
  data?: unknown;
  error?: unknown;
};

type HandleSubmitOptions = {
  formData: userCrediantailsType;
  requireName?: boolean;
  submit: (credentials: userCrediantailsType) => Promise<SubmitResult>;
  setLoading: (loading: boolean) => void;
  setFieldErrors: (errors: FormErrors) => void;
  setSubmitError: (error: string | null) => void;
  onSuccess: (result: SubmitResult) => void;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

/** Creates the shared submit handler used by the login and signup forms. */
export const createHandleSubmit = ({
  formData,
  requireName = false,
  submit,
  setLoading,
  setFieldErrors,
  setSubmitError,
  onSuccess,
}: HandleSubmitOptions) => {
  return async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fieldErrors = validateForm(formData, requireName);
    setFieldErrors(fieldErrors);
    setSubmitError(null);

    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const result = await submit({
        ...formData,
        email: formData.email.trim(),
        name: formData.name?.trim(),
      });

      if (!result.success) {
        setSubmitError(getErrorMessage(result.error));
        return;
      }

      onSuccess(result);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
};
