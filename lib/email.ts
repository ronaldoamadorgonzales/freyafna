import nodemailer from "nodemailer";

interface LeadInsightsEmailParams {
  leadName: string;
  leadEmail: string;
  insightsUrl: string;
  advisorName?: string;
  advisorTitle?: string;
  advisorPhone?: string;
  advisorEmail?: string;
}

interface AdvisorAlertEmailParams {
  advisorEmail: string;
  advisorName: string;
  leadName: string;
  leadEmail: string;
  leadMobile?: string | null;
  viewCount: number;
  viewedAt: Date;
  insightsUrl?: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || "mailpit";
  const port = parseInt(process.env.SMTP_PORT || "1025", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const auth = user && pass ? { user, pass } : undefined;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth,
    tls: {
      rejectUnauthorized: false
    }
  });
}

const FROM_EMAIL = process.env.EMAIL_FROM || "FreyaFNA Strategy Desk <noreply@freyafna.com>";

/**
 * Sends the 48-hour access link email to the prospective lead.
 */
export async function sendLeadInsightsEmail(params: LeadInsightsEmailParams): Promise<boolean> {
  const { leadName, leadEmail, insightsUrl, advisorName = "Ronald Gonzales", advisorTitle = "Senior Wealth Planner", advisorPhone, advisorEmail } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your 48-Hour VIP Strategy Brief</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#042f2e;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.03);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #0f766e 0%, #0d9488 100%);padding:36px 30px;text-align:center;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 12px auto;">
                <tr>
                  <td style="background-color:#ffffff;color:#0f766e;font-weight:900;font-size:18px;width:36px;height:36px;border-radius:10px;text-align:center;line-height:36px;">F</td>
                  <td style="color:#ffffff;font-size:22px;font-weight:800;padding-left:10px;letter-spacing:-0.5px;">Freya<span style="color:#a7f3d0;">FNA</span></td>
                </tr>
              </table>
              <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#ffffff;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:4px 12px;border-radius:999px;">
                VIP Extended Access
              </span>
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:12px 0 0 0;letter-spacing:-0.5px;">Your 48-Hour Strategy Brief</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px 30px;">
              <p style="font-size:16px;line-height:1.6;margin:0 0 16px 0;color:#1e293b;">
                Hello <strong>${leadName}</strong>,
              </p>
              <p style="font-size:14px;line-height:1.7;margin:0 0 24px 0;color:#475569;">
                Thank you for completing your Financial Needs Analysis. We have unlocked an interactive <strong>48-Hour Deep-Dive Strategy Brief</strong> tailored directly to your financial persona and baseline gaps.
              </p>

              <!-- Key Benefits Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-size:12px;font-weight:800;color:#0f766e;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Inside Your Extended Brief:</div>
                    <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.8;color:#334155;">
                      <li><strong>Multi-Rate Inflation Stress-Test</strong> (3%, 5%, and 8% scenarios)</li>
                      <li><strong>Prioritized 3-Step Action Roadmap</strong></li>
                      <li><strong>Detailed Protection & Capitalization Scorecards</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${insightsUrl}" target="_blank" style="display:inline-block;background-color:#0f766e;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;padding:16px 36px;border-radius:12px;box-shadow:0 4px 12px rgba(15,118,110,0.25);">
                      Open 48-Hour Strategy Brief &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background-color:#fffbeb;border:1px solid #fef3c7;border-radius:12px;padding:14px 16px;margin-bottom:28px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#92400e;font-weight:600;">
                  ⏱ <strong>Time-Limited Security:</strong> This personalized link will remain active for the next <strong>48 hours</strong>.
                </p>
              </div>

              <!-- Advisor Signature -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top:1px solid #f1f5f9;padding-top:24px;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Your Assigned Advisor:</div>
                    <div style="font-size:15px;font-weight:800;color:#042f2e;">${advisorName}</div>
                    <div style="font-size:13px;color:#0f766e;font-weight:600;">${advisorTitle}</div>
                    ${advisorPhone ? `<div style="font-size:12px;color:#64748b;margin-top:4px;">📞 ${advisorPhone}</div>` : ""}
                    ${advisorEmail ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">✉️ ${advisorEmail}</div>` : ""}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6;">
              &copy; 2026 FreyaFNA. All rights reserved.<br />
              This diagnostic brief was generated at your request for financial planning and calculation purposes.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: `"${leadName}" <${leadEmail}>`,
      subject: `Your 48-Hour VIP Strategy Brief is Ready - FreyaFNA`,
      html,
      text: `Hello ${leadName},\n\nYour 48-Hour VIP Strategy Brief is ready. You can access your report here:\n${insightsUrl}\n\nNote: This link is active for 48 hours.\n\nAssigned Advisor: ${advisorName}`
    });
    console.log(`[EMAIL SENT] Lead insights email successfully sent to ${leadEmail}`);
    return true;
  } catch (err) {
    console.error("[EMAIL ERROR] Could not send email via SMTP, logging fallback:", err);
    console.log(`
================================================================================
>>> LEAD 48-HOUR INSIGHTS EMAIL (FALLBACK CONSOLE LOG)
To: ${leadEmail}
Name: ${leadName}
Insights URL: ${insightsUrl}
================================================================================
    `);
    return false;
  }
}

/**
 * Sends a real-time notification alert to the advisor when their lead opens the 48-Hour Strategy Brief.
 */
export async function sendAdvisorAlertEmail(params: AdvisorAlertEmailParams): Promise<boolean> {
  const { advisorEmail, advisorName, leadName, leadEmail, leadMobile, viewCount, viewedAt, insightsUrl } = params;

  const appUrl = process.env.APP_URL || "http://localhost:3005";
  const portalUrl = `${appUrl}/portal`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>🔥 Hot Lead Activity Alert</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#042f2e;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.03);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#0f766e;padding:28px 30px;text-align:left;">
              <span style="display:inline-block;background:#fee2e2;color:#991b1b;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;padding:3px 10px;border-radius:999px;margin-bottom:8px;">
                🔥 Lead Activity Alert
              </span>
              <h2 style="color:#ffffff;font-size:20px;font-weight:800;margin:0;">Client Opened Strategy Brief</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <p style="font-size:15px;margin:0 0 16px 0;color:#1e293b;">
                Hello <strong>${advisorName}</strong>,
              </p>
              <p style="font-size:14px;line-height:1.6;margin:0 0 20px 0;color:#475569;">
                Your prospective client <strong>${leadName}</strong> has just accessed their <strong>48-Hour VIP Strategy Brief</strong>.
              </p>

              <!-- Client Info Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size:13px;color:#334155;">
                      <tr>
                        <td width="130" style="font-weight:700;color:#64748b;">Client Name:</td>
                        <td style="font-weight:800;color:#042f2e;">${leadName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:700;color:#64748b;">Email Address:</td>
                        <td><a href="mailto:${leadEmail}" style="color:#0f766e;font-weight:700;text-decoration:none;">${leadEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="font-weight:700;color:#64748b;">Mobile Number:</td>
                        <td style="font-weight:700;color:#042f2e;">${leadMobile || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:700;color:#64748b;">Total Views:</td>
                        <td><span style="display:inline-block;background:#ccfbf1;color:#0f766e;font-weight:800;padding:2px 8px;border-radius:6px;font-size:12px;">${viewCount} View${viewCount === 1 ? "" : "s"}</span></td>
                      </tr>
                      <tr>
                        <td style="font-weight:700;color:#64748b;">Last Viewed:</td>
                        <td style="color:#475569;">${viewedAt.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Portal CTA -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:10px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display:inline-block;background-color:#0f766e;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:10px;">
                      Open Advisor CRM Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:16px;text-align:center;font-size:11px;color:#94a3b8;">
              FreyaFNA Advisor Notification Engine
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: `"${advisorName}" <${advisorEmail}>`,
      subject: `🔥 Hot Lead Alert: ${leadName} just accessed their Strategy Brief!`,
      html,
      text: `Hello ${advisorName},\n\n${leadName} (${leadEmail}, ${leadMobile || "No mobile"}) has just opened their 48-Hour Strategy Brief.\nTotal Views: ${viewCount}\nTimestamp: ${viewedAt.toISOString()}\n\nView details in portal: ${portalUrl}`
    });
    console.log(`[EMAIL SENT] Advisor alert email successfully sent to ${advisorEmail} for lead ${leadEmail}`);
    return true;
  } catch (err) {
    console.error("[EMAIL ERROR] Could not send advisor alert email:", err);
    console.log(`
================================================================================
>>> ADVISOR HOT LEAD ALERT (FALLBACK CONSOLE LOG)
To: ${advisorEmail} (${advisorName})
Lead: ${leadName} (${leadEmail}, ${leadMobile})
Views: ${viewCount}
Timestamp: ${viewedAt.toISOString()}
================================================================================
    `);
    return false;
  }
}
