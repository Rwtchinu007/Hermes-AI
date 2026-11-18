import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";
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

// Mirrors the backend's registerValidator so users get instant feedback
function validate({ username, email, password, confirmPassword }) {
  const errors = {};
  if (username.length < 3 || username.length > 30) {
    errors.username = "Use 3–30 characters.";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = "Use only letters, numbers and underscores.";
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
  if (password.length < 6) errors.password = "At least 6 characters.";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";
  return errors;
}

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const { handleRegister } = useAuth();

  // Clear a field's error as soon as the user edits it
  const clearField = (name) =>
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const values = { username: username.trim(), email: email.trim(), password, confirmPassword };
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    const result = await handleRegister(values);
    setSubmitting(false);

    if (result.ok) {
      navigate("/verify-email", { state: { email: values.email } });
    } else {
      // Field-specific server errors (e.g. from validation) go under the field
      if (result.field && ["username", "email", "password"].includes(result.field)) {
        setErrors({ [result.field]: result.message });
      } else {
        setFormError(result.message);
      }
      setAttempt((n) => n + 1);
    }
  };

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Use Google, or sign up with email and we'll send a verification link."
      footer={
        <>
          Already have an account?{" "}
          <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <GoogleButton mode="signup" />

      <Divider />

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <FormError message={formError} attempt={attempt} />

        <Field label="Username" id="username" error={errors.username} attempt={attempt}>
          <TextInput
            id="username"
            autoComplete="username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              clearField("username");
            }}
            placeholder="ada_lovelace"
            invalid={Boolean(errors.username)}
            autoFocus
          />
        </Field>

        <Field label="Email" id="email" error={errors.email} attempt={attempt}>
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
            invalid={Boolean(errors.email)}
          />
        </Field>

        <div className="grid grid-cols-2 items-start gap-3">
          <Field label="Password" id="password" error={errors.password} attempt={attempt}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
              setPassword(event.target.value);
              clearField("password");
            }}
              placeholder="6+ characters"
              invalid={Boolean(errors.password)}
            />
          </Field>

          <Field label="Confirm" id="confirmPassword" error={errors.confirmPassword} attempt={attempt}>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearField("confirmPassword");
            }}
              placeholder="Repeat it"
              invalid={Boolean(errors.confirmPassword)}
            />
          </Field>
        </div>

        <div className="pt-0.5">
          <SubmitButton loading={submitting} loadingLabel="Creating account">
            Create account
          </SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
