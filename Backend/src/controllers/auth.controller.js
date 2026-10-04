import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

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

  await sendEmail({
    to: email,

    subject: "Welcome to Hermes.ai!",

    html: `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;

      background: #eeeeee;

      font-family: Arial, Helvetica, sans-serif;
      color: #ffffff;
    }

    .wrapper {
      width: 100%;

      padding: 40px 20px;

      background: #eeeeee;
    }

    .container {
      width: 100%;
      max-width: 560px;

      margin: 0 auto;

      padding: 38px 40px;

      background: #202020;

      border: 1px solid #3c3c3c;

      border-radius: 12px;
    }


    /* ================= LOGO ================= */

    .logo {
      margin-bottom: 28px;

      font-family: Arial, Helvetica, sans-serif;

      font-size: 24px;
      font-weight: 500;

      letter-spacing: -0.5px;
    }

    .logo-main {
      color: #e08d2e;
    }

    .logo-ai {
      color: #9b9b9b;
      font-weight: 400;
    }


    /* ================= DIVIDER ================= */

    .divider {
      width: 100%;
      height: 1px;

      background: #363636;

      margin-bottom: 32px;
    }


    /* ================= HEADING ================= */

    h1 {
      margin: 0 0 22px;

      font-size: 25px;
      line-height: 1.3;

      font-weight: 400;

      letter-spacing: -0.4px;

      color: #eeeeee;
    }


    /* ================= TEXT ================= */

    p {
      margin: 0 0 16px;

      font-size: 14px;
      line-height: 1.7;

      font-weight: 300;

      color: #a0a0a0;
    }

    .username {
      color: #dddddd;
      font-weight: 400;
    }

    .brand {
      color: #e08d2e;
      font-weight: 400;
    }


    /* ================= BUTTON ================= */

    .button-container {
      margin: 28px 0;
    }

    .button {
      display: inline-block;

      padding: 11px 22px;

      background: #e08d2e;

      color: #171717 !important;

      text-decoration: none;

      font-size: 13px;

      font-weight: 500;

      border-radius: 6px;
    }


    /* ================= FOOTER ================= */

    .bottom-divider {
      width: 100%;
      height: 1px;

      background: #363636;

      margin: 30px 0 22px;
    }

    .footer {
      margin: 0 0 12px;

      font-size: 12px;

      line-height: 1.6;

      color: #6f6f6f;
    }

    .team {
      color: #9a9a9a;

      font-weight: 400;
    }


    /* ================= MOBILE ================= */

    @media only screen and (max-width: 600px) {

      .wrapper {
        padding: 20px 10px;
      }

      .container {
        padding: 30px 24px;
      }

      .logo {
        font-size: 22px;
      }

      h1 {
        font-size: 23px;
      }

      p {
        font-size: 13px;
      }

    }

  </style>

</head>


<body>

  <div class="wrapper">

    <div class="container">


      <!-- LOGO -->

      <div class="logo">

        <span class="logo-main">
          Hermes
        </span>

        <span class="logo-ai">
          .ai
        </span>

      </div>


      <!-- DIVIDER -->

      <div class="divider"></div>


      <!-- HEADING -->

      <h1>
        Welcome to Hermes.ai
      </h1>


      <!-- GREETING -->

      <p>
        Hi
        <span class="username">
          ${username}
        </span>,
      </p>


      <!-- MESSAGE -->

      <p>
        Thank you for registering at
        <span class="brand">
          Hermes.ai
        </span>.
        We're excited to have you on board.
      </p>


      <p>
        Please verify your email address to activate
        your account and get started.
      </p>


      <!-- BUTTON -->

      <div class="button-container">

        <a
          href="/api/auth/verify-email?token=${emailVerificationToken}"
          class="button"
        >
          Verify Email →
        </a>

      </div>


      <!-- FOOTER -->

      <div class="bottom-divider"></div>


      <p class="footer">
        If you did not register for this account,
        please ignore this email.
      </p>


      <p class="footer">
        Best regards,<br />

        <span class="team">
          The Hermes.ai Team
        </span>

      </p>


    </div>

  </div>

</body>

</html>
`,
  });

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

  res.cookie("token", token);
  res.status(200).json({
    message: "User logged in successfully",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
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
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found",
      });
    }
    user.verified = true;
    await user.save();
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Email Verified | Hermes.ai</title>

  <!-- Custom Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Space+Grotesk:wght@400;500&display=swap"
    rel="stylesheet"
  />

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 20px;

      background: #181818;

      color: #ffffff;

      font-family: "Inter", Arial, sans-serif;
      font-weight: 300;
    }

    /* Main Card */

    .card {
      width: 100%;
      max-width: 500px;

      padding: 42px 42px 34px;

      background: #202020;

      border: 1px solid #3a3a3a;
      border-radius: 14px;

      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.25);
    }

    /* Logo */

    .logo {
      font-family: "Space Grotesk", sans-serif;

      font-size: 25px;
      font-weight: 400;

      letter-spacing: -0.8px;

      color: #e9e9e9;

      margin-bottom: 35px;
    }

    .logo .hermes {
      color: #e08d2e;
    }

    .logo .ai {
      color: #9b9b9b;
    }

    /* Divider */

    .divider {
      width: 100%;
      height: 1px;

      background: #353535;

      margin-bottom: 42px;
    }

    /* Check */

    .check {
      width: 52px;
      height: 52px;

      display: flex;
      align-items: center;
      justify-content: center;

      margin: 0 auto 25px;

      border: 1px solid #8c632f;
      border-radius: 50%;

      color: #e08d2e;

      font-size: 23px;
      font-weight: 300;
    }

    /* Heading */

    h1 {
      text-align: center;

      font-family: "Inter", sans-serif;

      font-size: 28px;
      font-weight: 300;

      letter-spacing: -0.8px;

      color: #eeeeee;

      margin-bottom: 18px;
    }

    /* Message */

    .message {
      max-width: 320px;

      margin: 0 auto;

      text-align: center;

      font-size: 14px;
      font-weight: 300;

      line-height: 1.8;

      color: #929292;
    }

    .username {
      color: #d7d7d7;
      font-weight: 400;
    }

    /* Button */

    .button-wrapper {
      text-align: center;

      margin-top: 30px;
    }

    .button {
      display: inline-block;

      padding: 12px 25px;

      background: #e08d2e;

      color: #171717;

      border-radius: 6px;

      text-decoration: none;

      font-family: "Inter", sans-serif;

      font-size: 13px;
      font-weight: 400;

      transition: opacity 0.2s ease;
    }

    .button:hover {
      opacity: 0.85;
    }

    /* Bottom */

    .bottom {
      margin-top: 38px;
      padding-top: 20px;

      border-top: 1px solid #353535;

      text-align: center;
    }

    .bottom-text {
      font-family: "Space Grotesk", sans-serif;

      font-size: 10px;
      font-weight: 400;

      letter-spacing: 3px;

      color: #666666;
    }

    /* Mobile */

    @media (max-width: 500px) {

      .card {
        padding: 35px 25px 28px;
      }

      .logo {
        font-size: 23px;
      }

      h1 {
        font-size: 24px;
      }

      .message {
        font-size: 13px;
      }

      .bottom-text {
        letter-spacing: 2px;
      }
    }

  </style>
</head>

<body>

  <div class="card">

    <!-- Hermes Logo -->

    <div class="logo">
      <span class="hermes">Hermes</span><span class="ai">.ai</span>
    </div>


    <!-- Divider -->

    <div class="divider"></div>


    <!-- Success -->

    <div class="check">
      ✓
    </div>


    <!-- Heading -->

    <h1>
      Email verified
    </h1>


    <!-- Message -->

    <p class="message">
      Hi <span class="username">${user.username}</span>,
      <br />

      Your email has been successfully verified.
      You can now use Hermes.ai.
    </p>


    <!-- Button -->

    <div class="button-wrapper">

      <a
        href="/login"
        class="button"
      >
        Continue to Login →
      </a>

    </div>


    <!-- Footer -->

    <div class="bottom">

      <p class="bottom-text">
        WELCOME TO HERMES.AI
      </p>

    </div>

  </div>

</body>
</html>
`;
    return res.send(html);
  } catch (err) {
    res.status(400).json({
      message: "Invalid or expired token",
      success: false,
      err: err.message,
    });
  }
}
