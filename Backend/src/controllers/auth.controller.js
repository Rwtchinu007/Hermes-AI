import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../services/mail.service.js";
import {
  verificationEmail,
  emailVerifiedPage,
  verificationFailedPage,
} from "../services/emailTemplates.js";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // matches JWT expiry (7d)

// Google Sign-In uses its own OAuth client ID (public, not a secret)
const getGoogleClientId = () => process.env.GOOGLE_OAUTH_CLIENT_ID || "";
// Optional: enables the popup "code" flow (custom-styled button).
// Never sent to the browser.
const getGoogleClientSecret = () => process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";

/**
 * Cookie options for the auth token.
 * remember=true -> persistent cookie for 7 days; false -> session cookie.
 */
function authCookieOptions(remember = true) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: SESSION_MAX_AGE } : {}),
  };
}

function issueAuthToken(res, user, remember = true) {
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("token", token, authCookieOptions(remember));
}

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  googleId: user.googleId ? true : undefined,
});

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function registerUser(req, res) {
  const { username, email, password } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User with this email or username already exists",
      success: false,
      err: "User already exists",
    });
  }

  const user = await userModel.create({ username, email, password });

  const emailVerificationToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_SECRET,
  );

  // Send the verification email. If it fails, remove the just-created
  // account so the user can simply try again (no half-created accounts).
  try {
  await sendEmail({
    to: email,

    subject: "Welcome to Hermes.ai!",

    html: verificationEmail({
      username,
      link: `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${emailVerificationToken}`,
    }),
  });
  } catch (error) {
    console.error("Verification email failed:", error?.response?.data || error?.message);
    await userModel.deleteOne({ _id: user._id });
    return res.status(503).json({
      message:
        "We couldn't send the verification email right now, so your account wasn't created. Please try again in a few minutes.",
      success: false,
      err: "Verification email failed",
    });
  }

  res.status(201).json({
    message: "User registered successfully",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
      success: false,
      err: "User not found",
    });
  }

  const isPasswordvalid = await user.comparePassword(password);
  if (!isPasswordvalid) {
    return res.status(400).json({
      message: "Invalid password",
      success: false,
      err: "Invalid password",
    });
  }

  if (!user.verified) {
    return res.status(400).json({
      message: "Please verify your email before logging in",
      success: false,
      err: "Email not verified",
    });
  }

  // "Remember me" defaults to true to preserve the previous 7-day session
  const remember = req.body.remember !== false;
  issueAuthToken(res, user, remember);

  res.status(200).json({
    message: "User logged in successfully",
    success: true,
    user: publicUser(user),
  });
}

/**
 * @desc Log out: clear the auth cookie
 * @route POST /api/auth/logout
 * @access Public (works even if the token already expired)
 */
export async function logoutUser(req, res) {
  const { maxAge, ...options } = authCookieOptions();
  res.clearCookie("token", options);
  res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
}

/**
 * @desc Public Google Sign-In config for the frontend
 * @route GET /api/auth/google/config
 * @access Public
 */
export async function getGoogleConfig(req, res) {
  const clientId = getGoogleClientId();
  res.status(200).json({
    success: true,
    enabled: Boolean(clientId),
    clientId: clientId || null,
    // "code": custom button + server-side code exchange (needs the secret)
    // "id_token": Google's pre-built button (client ID only)
    flow: clientId && getGoogleClientSecret() ? "code" : "id_token",
  });
}

/**
 * Build a unique username (3-30 chars, letters/numbers/underscore)
 */
async function generateUsername(base) {
  let cleaned = String(base || "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);
  if (cleaned.length < 3) cleaned = `user${cleaned}`;

  let candidate = cleaned;
  for (let i = 0; i < 10; i++) {
    const exists = await userModel.exists({ username: candidate });
    if (!exists) return candidate;
    candidate = `${cleaned}_${crypto.randomInt(1000, 99999)}`;
  }
  return `${cleaned}_${crypto.randomBytes(4).toString("hex")}`;
}

/**
 * @desc Sign in / sign up with Google
 * @route POST /api/auth/google
 * @access Public
 * @body { code } - one-time auth code from the GIS popup code flow, or
 *       { credential } - Google ID token from the pre-built GIS button
 */
export async function googleAuth(req, res) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return res.status(503).json({
      message: "Google sign-in is not configured on this server",
      success: false,
      err: "GOOGLE_OAUTH_CLIENT_ID missing",
    });
  }

  const { credential, code, remember } = req.body;
  const hasCode = typeof code === "string" && code.length > 0;
  const hasCredential = typeof credential === "string" && credential.length > 0;
  if (!hasCode && !hasCredential) {
    return res.status(400).json({
      message: "Missing Google credential",
      success: false,
    });
  }

  // Never trust client-provided profile data: verify the ID token
  let payload;
  try {
    let idToken = credential;

    if (hasCode) {
      const secret = getGoogleClientSecret();
      if (!secret) {
        return res.status(503).json({
          message: "Google sign-in is not fully configured on this server",
          success: false,
          err: "GOOGLE_OAUTH_CLIENT_SECRET missing",
        });
      }
      // Exchange the one-time code with Google ("postmessage" = popup flow)
      const exchanger = new OAuth2Client(clientId, secret, "postmessage");
      const { tokens } = await exchanger.getToken(code);
      idToken = tokens.id_token;
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error("Google sign-in failed:", err?.response?.data || err?.message);
    return res.status(401).json({
      message: "Google sign-in failed. Please try again.",
      success: false,
      err: "Invalid Google token",
    });
  }

  if (!payload?.email || !payload.email_verified) {
    return res.status(401).json({
      message: "Your Google account email is not verified",
      success: false,
    });
  }

  const email = payload.email.toLowerCase();

  let user = await userModel.findOne({ googleId: payload.sub });

  if (!user) {
    user = await userModel.findOne({ email });

    if (user) {
      // Existing email/password account: Google has verified ownership of
      // this email, so it's safe to link the Google identity to it.
      if (user.googleId && user.googleId !== payload.sub) {
        return res.status(409).json({
          message: "This email is linked to a different Google account",
          success: false,
        });
      }
      user.googleId = payload.sub;
      user.verified = true;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      await user.save();
    } else {
      user = await userModel.create({
        username: await generateUsername(
          payload.given_name || payload.name || email.split("@")[0],
        ),
        email,
        // Random password: Google accounts sign in via Google only
        password: crypto.randomBytes(32).toString("hex"),
        verified: true,
        googleId: payload.sub,
        avatar: payload.picture,
      });
    }
  }

  issueAuthToken(res, user, remember !== false);

  res.status(200).json({
    message: "User logged in successfully",
    success: true,
    user: publicUser(user),
  });
}

/**
 * @desc Get the logged-in user's information
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
  const userId = req.user.id;
  const user = await userModel.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "User not found",
    });
  }
  res.status(200).json({
    message: "User fetched successfully",
    success: true,
    user,
  });
}

/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).send(verificationFailedPage());
    }
    user.verified = true;
    await user.save();
    return res.send(emailVerifiedPage({ username: user.username }));
  } catch (err) {
    return res.status(400).send(verificationFailedPage());
  }
}
