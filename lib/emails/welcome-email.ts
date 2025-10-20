export function getWelcomeEmailHtml(userName: string, loginUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to RevEarth</title>
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
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Welcome to RevEarth!</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">
                Hello ${userName},
              </p>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">
                Welcome to RevEarth, your comprehensive carbon emissions tracking platform! We're excited to have you on board.
              </p>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">
                With RevEarth, you can:
              </p>
              <ul style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 28px; padding-left: 20px;">
                <li>Track your organization's Scope 1, 2, and 3 emissions</li>
                <li>Generate detailed emissions reports</li>
                <li>Monitor trends and set reduction targets</li>
                <li>Manage multiple facilities</li>
                <li>Export data for compliance and audits</li>
              </ul>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 24px;">
                Get started by logging in and setting up your organization:
              </p>
              <table role="presentation" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="border-radius: 6px; background-color: #16a34a;">
                    <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">Get Started</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #999999; font-size: 14px; line-height: 20px;">
                If you have any questions or need assistance, feel free to reach out to our support team.
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

export function getWelcomeEmailText(userName: string, loginUrl: string): string {
  return `
Welcome to RevEarth!

Hello ${userName},

Welcome to RevEarth, your comprehensive carbon emissions tracking platform! We're excited to have you on board.

With RevEarth, you can:
- Track your organization's Scope 1, 2, and 3 emissions
- Generate detailed emissions reports
- Monitor trends and set reduction targets
- Manage multiple facilities
- Export data for compliance and audits

Get started by logging in and setting up your organization:
${loginUrl}

If you have any questions or need assistance, feel free to reach out to our support team.

© ${new Date().getFullYear()} RevEarth. All rights reserved.
  `.trim();
}
