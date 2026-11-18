import dotenv from "dotenv";
dotenv.config();

// Sends transactional email through Brevo's HTTPS API (works on hosts that
// block SMTP ports, e.g. Render's free tier).
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.MAIL_FROM;

  if (!apiKey || !senderEmail) {
    throw new Error("BREVO_API_KEY and MAIL_FROM must be set to send email");
  }

  try {
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Hermes AI", email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        `Brevo ${response.status}: ${data.message || JSON.stringify(data)}`,
      );
    }

    console.log("Email sent successfully:", data.messageId);
    return data;
  } catch (error) {
    console.error("Email sending error:", error.message);
    throw error;
  }
}
