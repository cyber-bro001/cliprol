import type { userCrediantailsType } from "../../types";

export type FormErrors = Partial<Record<keyof userCrediantailsType, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates credentials before an authentication request is made. */
export const validateForm = (
  { email, password, name }: userCrediantailsType,
  requireName = false,
): FormErrors => {
  const errors: FormErrors = {};

  if (requireName && !name?.trim()) {
    errors.name = "Please enter your full name.";
  }

  if (!email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!emailPattern.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Please enter your password.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
};
