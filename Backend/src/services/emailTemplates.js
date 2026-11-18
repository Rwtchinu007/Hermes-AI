// HTML templates for the verification email and the pages shown after the
// user clicks the verification link.

const BRAND = "#e08d2e";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// ---------------------------------------------------------------------------
// Verification email (table layout + inline styles for email-client support)
// ---------------------------------------------------------------------------
export function verificationEmail({ username, link }) {
  const name = escapeHtml(username);
  const href = escapeHtml(link);
  const font =
    "'Inter','Segoe UI',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Verify your email</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    @media only screen and (max-width: 520px) {
      .container { width: 100% !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
      .title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f1ec;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Confirm your email to activate your Hermes.ai account.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1ec;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="left" style="padding:0 4px 20px;font-family:${font};font-size:22px;font-weight:600;letter-spacing:-0.5px;color:#1c1c1c;">
              Hermes<span style="color:${BRAND};">.ai</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e7e2da;border-radius:14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <tr>
                  <td class="px" style="padding:40px 40px 8px;font-family:${font};">
                    <div style="font-size:12px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND};">
                      Verify your email
                    </div>
                    <h1 class="title" style="margin:12px 0 0;font-family:${font};font-size:28px;line-height:1.25;font-weight:600;letter-spacing:-0.6px;color:#1c1c1c;">
                      Welcome, ${name}
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td class="px" style="padding:12px 40px 0;font-family:${font};font-size:15px;line-height:1.7;color:#55524d;">
                    Thanks for signing up for Hermes.ai. Confirm your email
                    address to activate your account and start chatting.
                  </td>
                </tr>

                <!-- Button -->
                <tr>
                  <td class="px" style="padding:28px 40px 8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" bgcolor="${BRAND}" style="border-radius:8px;">
                          <a href="${href}" target="_blank"
                             style="display:inline-block;padding:14px 28px;font-family:${font};font-size:15px;font-weight:600;color:#1a1208;text-decoration:none;border-radius:8px;">
                            Verify email address
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Fallback link -->
                <tr>
                  <td class="px" style="padding:20px 40px 36px;font-family:${font};font-size:12.5px;line-height:1.7;color:#8a857d;">
                    Button not working? Paste this link into your browser:<br />
                    <a href="${href}" style="color:${BRAND};word-break:break-all;text-decoration:none;">${href}</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="left" style="padding:20px 4px 0;font-family:${font};font-size:12.5px;line-height:1.7;color:#8a857d;">
              If you didn&rsquo;t create a Hermes.ai account, you can safely ignore this email.
              <br />&mdash; The Hermes.ai Team
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Page shown after clicking the verification link
// ---------------------------------------------------------------------------
function statusPage({
  title,
  icon,
  heading,
  message,
  buttonLabel,
  buttonHref,
  tone,
  features = [],
  redirectSeconds = 0,
}) {
  const accent = tone === "error" ? "#e5654f" : BRAND;

  const featureList = features.length
    ? `<ul class="features">${features
        .map(
          (f) =>
            `<li><span class="f-icon">${f.icon}</span><span class="f-text"><b>${escapeHtml(f.title)}</b>${escapeHtml(f.text)}</span></li>`,
        )
        .join("")}</ul>`
    : "";

  const redirectNote = redirectSeconds
    ? `<p class="redirect">Redirecting automatically in <span id="count">${redirectSeconds}</span>s</p>`
    : "";

  const redirectScript = redirectSeconds
    ? `<script>
    (function () {
      var left = ${Number(redirectSeconds)};
      var el = document.getElementById("count");
      var timer = setInterval(function () {
        left -= 1;
        if (el) el.textContent = left;
        if (left <= 0) { clearInterval(timer); window.location.href = ${JSON.stringify(buttonHref)}; }
      }, 1000);
    })();
  </script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | Hermes.ai</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&family=Sora:wght@500;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      background:
        radial-gradient(600px 320px at 50% 0%, ${accent}22, transparent 70%),
        #121212;
      color: #f2f2f2;
      font-family: "Inter", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .wrap { width: 100%; max-width: 460px; animation: rise 0.5s ease both; }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .logo img { width: 30px; height: 30px; display: block; }
    .wordmark { font-family: "Sora", "Inter", sans-serif; font-size: 18px; line-height: 1; letter-spacing: -0.03em; font-weight: 600; color: #f2f2f2; }
    .wordmark span { font-weight: 500; color: #8c8c8c; }

    .card {
      padding: 40px 32px 28px;
      text-align: center;
      background: #1c1c1c;
      border: 1px solid #323232;
      border-radius: 18px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
    }

    .icon {
      position: relative;
      width: 60px;
      height: 60px;
      margin: 0 auto 22px;
      display: grid;
      place-items: center;
      color: ${accent};
      background: ${accent}1a;
      border: 1px solid ${accent}55;
      border-radius: 50%;
    }
    .icon::after {
      content: "";
      position: absolute;
      inset: -7px;
      border: 1px solid ${accent}33;
      border-radius: 50%;
      animation: ring 2.4s ease-out infinite;
    }
    .icon svg { width: 28px; height: 28px; }
    .icon svg path, .icon svg circle { stroke-dasharray: 60; stroke-dashoffset: 60; animation: draw 0.7s 0.25s ease forwards; }

    h1 {
      font-family: "Plus Jakarta Sans", "Inter", sans-serif;
      font-size: 26px;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.6px;
      margin-bottom: 10px;
    }

    .message { font-size: 14.5px; line-height: 1.7; color: #a3a3a3; }
    .message strong { color: #e8e8e8; font-weight: 500; }

    .features {
      list-style: none;
      margin-top: 26px;
      padding: 6px 16px;
      text-align: left;
      background: #232323;
      border: 1px solid #303030;
      border-radius: 12px;
    }
    .features li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
    }
    .features li + li { border-top: 1px solid #2e2e2e; }
    .f-icon {
      flex: none;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      color: ${BRAND};
      background: ${BRAND}1a;
      border-radius: 8px;
    }
    .f-icon svg { width: 16px; height: 16px; }
    .f-text { font-size: 13px; line-height: 1.45; color: #8f8f8f; }
    .f-text b { display: block; font-size: 13.5px; font-weight: 500; color: #ececec; }

    .button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 48px;
      margin-top: 24px;
      background: ${BRAND};
      color: #1a1208;
      border-radius: 11px;
      font-size: 14.5px;
      font-weight: 600;
      text-decoration: none;
      transition: filter 0.15s ease, transform 0.15s ease;
    }
    .button:hover { filter: brightness(1.08); }
    .button:active { transform: scale(0.99); }
    .button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    .button svg { width: 16px; height: 16px; }

    .redirect { margin-top: 14px; font-size: 12.5px; color: #6f6f6f; }
    .redirect span { color: #b5b5b5; font-variant-numeric: tabular-nums; }

    .foot { margin-top: 20px; font-size: 12px; text-align: center; color: #666; }

    @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @keyframes ring { 0% { opacity: 0.8; transform: scale(0.92); } 100% { opacity: 0; transform: scale(1.25); } }

    @media (prefers-reduced-motion: reduce) {
      .wrap, .icon::after, .icon svg path, .icon svg circle { animation: none; }
      .icon svg path, .icon svg circle { stroke-dashoffset: 0; }
    }

    @media (max-width: 480px) {
      .card { padding: 32px 20px 22px; }
      h1 { font-size: 23px; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <div class="logo"><img src="/favicon.svg" alt="" /><div class="wordmark">Hermes<span>.ai</span></div></div>

    <section class="card">
      <div class="icon">${icon}</div>
      <h1>${heading}</h1>
      <p class="message">${message}</p>
      ${featureList}
      <a class="button" href="${escapeHtml(buttonHref)}">${escapeHtml(buttonLabel)}${ARROW_ICON}</a>
      ${redirectNote}
    </section>

    <p class="foot">Think. Create. Explore.</p>
  </main>
  ${redirectScript}
</body>
</html>`;
}

const svg = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const CHECK_ICON = svg('<path d="M20 6 9 17l-5-5"/>');
const ALERT_ICON = svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>');
const ARROW_ICON = svg('<path d="M5 12h14M13 6l6 6-6 6"/>');

const FEATURES = [
  {
    icon: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    title: "Ask anything",
    text: "Get clear answers, code help and ideas.",
  },
  {
    icon: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>'),
    title: "Live web search",
    text: "Up-to-date answers pulled from the internet.",
  },
];

export function emailVerifiedPage({ username }) {
  return statusPage({
    title: "Email verified",
    icon: CHECK_ICON,
    heading: "You&rsquo;re all set",
    message: `Thanks, <strong>${escapeHtml(username)}</strong>. Your email is verified and your account is ready.`,
    buttonLabel: "Continue to sign in",
    buttonHref: "/login",
    features: FEATURES,
    redirectSeconds: 8,
  });
}

export function verificationFailedPage() {
  return statusPage({
    title: "Link not valid",
    icon: ALERT_ICON,
    heading: "This link isn&rsquo;t valid",
    message:
      "The verification link is invalid or has already been used. Try signing in, or create your account again.",
    buttonLabel: "Back to sign in",
    buttonHref: "/login",
    tone: "error",
  });
}
