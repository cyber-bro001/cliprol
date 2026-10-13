import { hasPendingUpload } from "../../lib/authHelpers/pendingInput";
import { useCliprolContext } from "../../context/CliprolContext";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginDestination } from "../../lib/authHelpers/destination";
import type { userCrediantailsType, loadingStateType } from "../../types";
import { createHandleSubmit } from "../../lib/authHelpers/handleSubmit";
import type { FormErrors } from "../../lib/authHelpers/validateForm";

const SignupPage = () => {
  const [formData, setFormData] = useState<userCrediantailsType>({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState<loadingStateType["isLoading"]>(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { signUpWithEmail } = useCliprolContext();
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = createHandleSubmit({
    formData,
    requireName: true,
    submit: signUpWithEmail,
    setLoading,
    setFieldErrors,
    setSubmitError,
    onSuccess: () => navigate(loginDestination(location.state, sessionStorage.getItem("cliprol.pendingVideoUrl"), hasPendingUpload()), { replace: true }),
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10">
          <a
            href="/"
            className="text-xl font-bold text-[var(--color-text)] tracking-tight"
          >
            Cliprol
          </a>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-text)] tracking-tight mb-1">
            Create an account
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] font-light">
            Less time editing. <br />
            More time creating.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--color-text-muted)] font-medium tracking-wide uppercase">
              Full Name
            </span>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              type="text"
              placeholder="Peller Jarvis"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm px-4 py-3 rounded-[var(--radius-sm)] outline-none placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-text-muted)] transition-colors duration-150"
              required
            />
            {fieldErrors.name && <span className="text-xs text-red-400">{fieldErrors.name}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--color-text-muted)] font-medium tracking-wide uppercase">
              Email
            </span>
            <input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              type="email"
              placeholder="pellerjarvis@example.com"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm px-4 py-3 rounded-[var(--radius-sm)] outline-none placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-text-muted)] transition-colors duration-150"
              required
            />
            {fieldErrors.email && <span className="text-xs text-red-400">{fieldErrors.email}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--color-text-muted)] font-medium tracking-wide uppercase">
              Password
            </span>
            <input
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type="password"
              placeholder="••••••••"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm px-4 py-3 rounded-[var(--radius-sm)] outline-none placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-text-muted)] transition-colors duration-150"
              required
            />
            {fieldErrors.password && <span className="text-xs text-red-400">{fieldErrors.password}</span>}
          </label>

          {submitError && <p role="alert" className="text-xs text-red-400">{submitError}</p>}

          <button
            type="submit"
            className={`w-full bg-[var(--color-accent)] text-[var(--color-bg)] text-sm font-semibold py-3 rounded-[var(--radius-sm)] hover:bg-[var(--color-accent)]/40 transition-colors duration-150 mt-2 cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--color-border)]"></div>
          <span className="text-xs text-[var(--color-text-dim)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]"></div>
        </div>

        {/* Google */}
        <button className="w-full flex items-center justify-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium py-3 rounded-[var(--radius-sm)] hover:border-[var(--color-text-muted)] cursor-pointer transition-colors duration-150">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Login link */}
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="text-[var(--color-text)] hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignupPage;
