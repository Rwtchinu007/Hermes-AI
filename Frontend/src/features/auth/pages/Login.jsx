import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { useSelector } from "react-redux";

import { useAuth } from "../hooks/useAuth";
import AuthLayout, { AuthLink } from "../components/AuthLayout";
import GoogleButton from "../components/GoogleButton";
import {
  Divider,
  Field,
  FormError,
  PasswordInput,
  SubmitButton,
  TextInput,
} from "../components/FormControls";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [attempt, setAttempt] = useState(0);

  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  // Clear a field's error as soon as the user edits it
  const clearField = (name) =>
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");

    // Check the basics before calling the server
    const nextErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) nextErrors.email = "Enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) nextErrors.email = "That doesn't look like a valid email.";
    if (!password) nextErrors.password = "Enter your password.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    const result = await handleLogin({ email: trimmedEmail, password, remember });
    setSubmitting(false);

    if (result.ok) {
      navigate("/", { replace: true });
      return;
    }

    // Show the problem next to the right field when we know which one
    if (result.field === "email" || result.field === "password") {
      setFieldErrors({ [result.field]: result.message });
    } else {
      setError(result.message);
    }
    setAttempt((n) => n + 1);
  };

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Hermes.ai account."
      footer={
        <>
          Don't have an account?{" "}
          <AuthLink to="/register">Sign up</AuthLink>
        </>
      }
    >
      <GoogleButton remember={remember} />

      <Divider />

      <form onSubmit={submitForm} className="space-y-4" noValidate>
        <FormError message={error} attempt={attempt} />

        <Field label="Email" id="email" error={fieldErrors.email} attempt={attempt}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearField("email");
            }}
            placeholder="you@example.com"
            invalid={Boolean(fieldErrors.email)}
            autoFocus
          />
        </Field>

        <Field label="Password" id="password" error={fieldErrors.password} attempt={attempt}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearField("password");
            }}
            placeholder="Your password"
            invalid={Boolean(fieldErrors.password)}
          />
        </Field>

        <label className="flex w-fit cursor-pointer select-none items-center gap-2 text-[12px] text-white/55">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer rounded-sm accent-[#e08d2e]"
          />
          Keep me signed in for 7 days
        </label>

        <SubmitButton loading={submitting} loadingLabel="Signing in">
          Sign in
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default Login;
