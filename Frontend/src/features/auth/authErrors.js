/*
  Turn auth failures into clear, friendly messages.
  Returns { message, field } — `field` is set when the problem belongs to a
  specific input (so the page can highlight it instead of showing a banner).
*/

const KNOWN = [
  {
    match: /user not found/i,
    message: "No account found with that email. Check it, or sign up instead.",
    field: "email",
  },
  {
    match: /invalid password/i,
    message: "That password isn't right. Try again.",
    field: "password",
  },
  {
    match: /verify your email/i,
    message:
      "Your email isn't verified yet. Open the link we emailed you, then sign in. (Check spam too.)",
  },
  {
    match: /couldn't send the verification email/i,
    message:
      "We couldn't send your verification email right now, so the account wasn't created. Please try again in a few minutes.",
  },
  {
    match: /already exists/i,
    message: "That email or username is already taken. Try signing in instead.",
  },
  {
    match: /linked to a different google account/i,
    message: "This email is already linked to a different Google account.",
  },
  {
    match: /google account email is not verified/i,
    message: "Your Google account's email isn't verified, so we can't use it to sign in.",
  },
  {
    match: /not (fully )?configured/i,
    message: "Google sign-in isn't available right now. Use your email and password instead.",
  },
  {
    match: /google sign-in failed|invalid google token/i,
    message: "Google sign-in didn't go through. Please try again.",
  },
];

const FALLBACK = {
  login: "We couldn't sign you in. Please try again.",
  register: "We couldn't create your account. Please try again.",
  google: "Google sign-in didn't go through. Please try again.",
};

export function getAuthError(error, context = "login") {
  // No response at all: offline, server down, CORS, timeout
  if (!error?.response) {
    if (error?.code === "ECONNABORTED") {
      return { message: "The request took too long. Check your connection and try again." };
    }
    return {
      message: "Can't reach Hermes right now. Check your internet connection and try again.",
    };
  }

  const { status, data } = error.response;

  // express-validator: { errors: [{ msg, path }] }
  if (Array.isArray(data?.errors) && data.errors.length) {
    const first = data.errors[0];
    return { message: first.msg, field: first.path };
  }

  const raw = typeof data === "object" ? data?.message || data?.err || "" : "";
  const known = KNOWN.find((entry) => entry.match.test(raw));
  if (known) return { message: known.message, field: known.field };

  if (status === 429) return { message: "Too many attempts. Please wait a minute and try again." };
  if (status >= 500) {
    return {
      message:
        context === "register"
          ? "Something went wrong creating your account (we may not have been able to send the verification email). Please try again in a moment."
          : "Something went wrong on our side. Please try again in a moment.",
    };
  }

  return { message: raw || FALLBACK[context] || FALLBACK.login };
}
