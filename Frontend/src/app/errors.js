/**
 * Turn an axios / thrown error into a short, user-facing message.
 * Understands express-validator's `{ errors: [{ msg }] }` shape.
 */
export function getErrorMessage(error, fallback = "Something went wrong") {
  const data = error?.response?.data;
  if (data?.errors?.length) return data.errors[0].msg;
  if (data?.message) return data.message;
  if (error?.code === "ERR_NETWORK") {
    return "Can't reach Hermes. Check your connection and try again.";
  }
  return error?.message || fallback;
}
