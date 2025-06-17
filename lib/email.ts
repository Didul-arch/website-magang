import nodemailer from "nodemailer";

const SMTP_SERVER_USERNAME = process.env.SMTP_SERVER_USERNAME;
const SMTP_SERVER_PASSWORD = process.env.SMTP_SERVER_PASSWORD;
const COMPANY_NAME = process.env.COMPANY_NAME || "PT Mada Wikri Tunggal";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_SERVER_USERNAME,
    pass: SMTP_SERVER_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: SMTP_SERVER_USERNAME,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

export function getApplicationConfirmationTemplate(data: {
  userName: string;
  positionTitle: string;
}) {
  const { userName, positionTitle } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #0066cc;
      padding: 20px;
      text-align: center;
      color: white;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 5px 5px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #666;
    }
    .button {
      display: inline-block;
      background-color: #0066cc;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin-top: 15px;
      font-weight: 500;
    }
    h2 {
      color: #0066cc;
      margin-top: 0;
    }
    .timeline {
      margin: 25px 0;
      padding: 15px;
      background-color: #e8f4fc;
      border-radius: 5px;
      border-left: 5px solid #0066cc;
    }
    .timeline h4 {
      margin-top: 0;
      color: #0066cc;
    }
    .highlight {
      font-weight: 600;
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Received</h1>
    </div>
    
    <div class="content">
      <h2>Thank You for Your Application!</h2>
      
      <p>Dear <span class="highlight">${userName}</span>,</p>
      
      <p>We are pleased to confirm that we have successfully received your application for the <span class="highlight">${positionTitle}</span> position at ${COMPANY_NAME}.</p>
      
      <div class="timeline">
        <h4>What Happens Next?</h4>
        <p>Our team will carefully review your application and qualifications. This process typically takes 1-2 weeks. You will receive updates on your application status via email.</p>
      </div>
      
      <p>In the meantime:</p>
      <ul>
        <li>Make sure to check your email regularly, including your spam folder</li>
        <li>Keep your phone nearby as we may contact you for further information or to schedule an interview</li>
        <li>Feel free to log into your account to check the status of your application</li>
      </ul>
      
      <p>We appreciate your interest in this position and the time you've taken to apply.</p>
      
      <p>Best regards,<br>
      The Recruitment Team</p>
      
      <a href="${
        process.env.NEXT_PUBLIC_API_URL || "https://your-website.com"
      }/dashboard" class="button">View Your Application</a>
    </div>
    
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
