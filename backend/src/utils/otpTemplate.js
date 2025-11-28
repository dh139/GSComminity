// utils/otpTemplate.js
export const otpEmailTemplate = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .body { padding: 40px 30px; text-align: center; color: #444; }
    .otp { font-size: 36px; font-weight: bold; letter-spacing: 8px; background: #f0f2ff; color: #667eea; padding: 20px; border-radius: 12px; display: inline-block; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="body">
      <h2>Hello ${name.split(" ")[0]},</h2>
      <p>We received a request to reset your password. Here is your secure One-Time Password (OTP):</p>
      <div class="otp">${otp}</div>
      <p>This OTP is valid for the next <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your Community App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;