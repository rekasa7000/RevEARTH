export function getPasswordResetEmailHtml(resetUrl: string, userName?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #16a34a; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">RevEarth</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Reset Your Password</h2>
              ${userName ? `<p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">Hello ${userName},</p>` : ''}
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">
                We received a request to reset your password for your RevEarth account. Click the button below to create a new password.
              </p>
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 6px; background-color: #16a34a;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 20px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px 0; color: #16a34a; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              <p style="margin: 0 0 10px 0; color: #ff6b6b; font-size: 14px; line-height: 20px; font-weight: bold;">
                This link will expire in 1 hour.
              </p>
              <p style="margin: 0; color: #999999; font-size: 14px; line-height: 20px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} RevEarth. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getPasswordResetEmailText(resetUrl: string, userName?: string): string {
  return `
Reset Your Password

${userName ? `Hello ${userName},` : 'Hello,'}

We received a request to reset your password for your RevEarth account. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

© ${new Date().getFullYear()} RevEarth. All rights reserved.
  `.trim();
}