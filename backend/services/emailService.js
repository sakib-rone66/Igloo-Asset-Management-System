const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [email],
      subject: "Reset Your Igloo Password",

      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Reset Your Igloo Password</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background-color: #f4f7f5;
              font-family: Arial, sans-serif;
            "
          >

            <div
              style="
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid #e5e7eb;
              "
            >

              <!-- Header -->

              <div
                style="
                  padding: 28px;
                  background-color: #198754;
                  color: #ffffff;
                "
              >
                <h1
                  style="
                    margin: 0;
                    font-size: 24px;
                  "
                >
                  Igloo Asset Management
                </h1>
              </div>

              <!-- Content -->

              <div
                style="
                  padding: 32px;
                  color: #374151;
                "
              >

                <h2
                  style="
                    margin-top: 0;
                    color: #111827;
                  "
                >
                  Reset Your Password
                </h2>

                <p>
                  Hello ${name},
                </p>

                <p>
                  We received a request to reset the password
                  for your Igloo Asset Management account.
                </p>

                <p>
                  Click the button below to create a new password.
                </p>

                <!-- Button -->

                <div
                  style="
                    margin: 30px 0;
                    text-align: center;
                  "
                >
                  <a
                    href="${resetUrl}"
                    style="
                      display: inline-block;
                      padding: 13px 24px;
                      background-color: #198754;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                    "
                  >
                    Reset Password
                  </a>
                </div>

                <p
                  style="
                    font-size: 13px;
                    color: #6b7280;
                  "
                >
                  This password reset link will expire in
                  15 minutes.
                </p>

                <p
                  style="
                    font-size: 13px;
                    color: #6b7280;
                  "
                >
                  If you did not request a password reset,
                  you can safely ignore this email.
                </p>

              </div>

              <!-- Footer -->

              <div
                style="
                  padding: 20px 32px;
                  background-color: #f9fafb;
                  color: #9ca3af;
                  font-size: 12px;
                "
              >
                Igloo Asset Management System
              </div>

            </div>

          </body>
        </html>
      `,

      text: `
Hello ${name},

We received a request to reset your Igloo Asset Management password.

Reset your password here:

${resetUrl}

This password reset link will expire in 15 minutes.

If you did not request this password reset, you can safely ignore this email.

Igloo Asset Management System
      `,
    });

    if (error) {
      console.error("Resend Email Error:", error);

      throw new Error("Failed to send password reset email");
    }

    console.log("Password reset email sent:", data.id);

    return data;
  } catch (error) {
    console.error("Password Reset Email Error:", error.message);

    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
