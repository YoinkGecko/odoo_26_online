const { sendEmail } = require("../mail_notification_service/producer");
const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { CustomAPIError } = require("../errors/custom-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/connect");

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const SELF_REGISTERABLE_ROLES = [
  "FLEET_MANAGER",
  "DISPATCHER",
  "DRIVER",
  "SAFETY_OFFICER",
  "FINANCIAL_ANALYST",
];

const register = async (req, res) => {

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new CustomAPIError("Provide all details", StatusCodes.BAD_REQUEST);
  }


  if (!SELF_REGISTERABLE_ROLES.includes(role)) {
    throw new CustomAPIError(
      `Role must be one of: ${SELF_REGISTERABLE_ROLES.join(", ")}`,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error:
        "Password must be at least 8 characters long and include at least one letter, one number, and one special character.",
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const queryText = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, role;
    `;

    const result = await pool.query(queryText, [
      name,
      email,
      hashedPassword,
      role,
    ]);

    const newUser = result.rows[0];

    const token = jwt.sign(
      { userId: newUser.id, email: email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const emailHtmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f4f5f7; padding-bottom: 40px; padding-top: 40px; }
          .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-collapse: collapse; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
          .header { background-color: #4f46e5; padding: 40px 32px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; }
          .content { padding: 40px 32px; background-color: #ffffff; }
          .content p { color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px; }
          .content p.highlight { font-size: 18px; font-weight: 600; color: #111827; }
          .footer { background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #f3f4f6; }
          .footer p { font-size: 13px; color: #9ca3af; margin: 0; }
        </style>
      </head>
      <body>
        <center class="wrapper">
          <table class="main" width="100%">
            <!-- Header section -->
            <tr>
              <td class="header">
                <h1>Welcome to our platform!</h1>
              </td>
            </tr>
            <!-- Content section -->
            <tr>
              <td class="content">
                <p class="highlight">Hi ${name},</p>
                <p>Your account has been created successfully. We are absolutely thrilled to have you on board with us!</p>
                <p>You now have full access to your dashboard, where you can manage your settings, customize your profile, and explore everything we have to offer.</p>
                <p>If you have any questions or need help getting set up, simply reply to this email. Our support team is always here for you.</p>
              </td>
            </tr>
            <!-- Footer section -->
            <tr>
              <td class="footer">
                <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </center>
      </body>
      </html>
    `;

    await sendEmail({
      email,
      subject: `Welcome ${name}!`,
      body: emailHtmlBody,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    console.error(error);
    res.status(500).json({ error: "Something went wrong on the server" });
  }
};

const ASSIGNABLE_ROLES = [
  "FLEET_MANAGER",
  "DISPATCHER",
  "DRIVER",
  "SAFETY_OFFICER",
  "FINANCIAL_ANALYST",
];


const buildStaffWelcomeEmail = ({ name, email, role }) => {
  const roleLabel = ROLE_LABELS[role] || role;
  const loginUrl = "http://localhost:3000/login";
 
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color:#1a3d63; padding:24px 32px;">
                  <span style="color:#ffffff; font-size:20px; font-weight:bold;">TransitOps</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <h1 style="margin:0 0 16px; font-size:20px; color:#1a1a1a;">Welcome, ${name}!</h1>
                  <p style="margin:0 0 16px; font-size:14px; line-height:1.6; color:#444444;">
                    An account has been created for you on TransitOps, the fleet operations
                    platform used to manage vehicles, trips, and maintenance.
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; border-radius:6px; margin:0 0 24px;">
                    <tr>
                      <td style="padding:16px 20px; font-size:14px; color:#444444;">
                        <strong>Email:</strong> ${email}<br/>
                        <strong>Role:</strong> ${roleLabel}
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#444444;">
                    You can log in using the password provided to you separately by your
                    administrator. For security, we recommend changing it after your first login.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color:#1a3d63; border-radius:6px;">
                        <a href="${loginUrl}" style="display:inline-block; padding:12px 24px; font-size:14px; color:#ffffff; text-decoration:none; font-weight:bold;">
                          Log in to TransitOps
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px; border-top:1px solid #eeeeee;">
                  <p style="margin:0; font-size:12px; color:#999999;">
                    If you weren't expecting this account, please contact your administrator.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};
 
const createStaffUser = async (req, res) => {
  const { name, email, password, role } = req.body;
 
  if (!name || !email || !password || !role) {
    throw new CustomAPIError("Provide all details", StatusCodes.BAD_REQUEST);
  }
 
  if (!ASSIGNABLE_ROLES.includes(role)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: `Role must be one of: ${ASSIGNABLE_ROLES.join(", ")}`,
    });
  }
 
  if (!PASSWORD_REGEX.test(password)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error:
        "Password must be at least 8 characters long and include at least one letter, one number, and one special character.",
    });
  }
 
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
 
    const queryText = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role;
    `;
    const result = await pool.query(queryText, [
      name,
      email,
      hashedPassword,
      role,
    ]);
 
    const newUser = result.rows[0];
 
    const emailHtmlBody = buildStaffWelcomeEmail({ name, email, role });
    await sendEmail({
      email,
      subject: `Welcome to TransitOps, ${name}!`,
      body: emailHtmlBody,
    });
 
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Staff account created successfully",
      user: newUser,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
 
    console.error(error);
    res.status(500).json({ error: "Something went wrong on the server" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomAPIError("Provide all details", StatusCodes.BAD_REQUEST);
  }

  const queryText = `SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1`;
  const result = await pool.query(queryText, [email]);
  const user = result.rows[0];

  if (!user) {
    throw new CustomAPIError("No user Found", StatusCodes.NOT_FOUND);
  }

  if (!user.is_active) {
    throw new CustomAPIError(
      "This account has been deactivated",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordCorrect) {
    throw new CustomAPIError("Invalid Credentials", StatusCodes.UNAUTHORIZED);
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );


  await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [
    user.id,
  ]);

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      role: user.role,
    },
    token,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomAPIError(
      "Please provide an email address",
      StatusCodes.BAD_REQUEST,
    );
  }

  const userQuery = `SELECT id, name FROM users WHERE email = $1`;
  const userResult = await pool.query(userQuery, [email]);
  const user = userResult.rows[0];


  if (!user) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "If an account exists with that email, a reset link has been sent.",
    });
  }

  await pool.query(`DELETE FROM password_resets WHERE user_id = $1`, [
    user.id,
  ]);

  const resetToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  const insertResetQuery = `
    INSERT INTO password_resets (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
  `;
  await pool.query(insertResetQuery, [user.id, tokenHash, expiresAt]);

  const resetUrl = `http://localhost:3000/api/v1/auth/reset-password/${resetToken}/${user.id}`;

  const emailHtmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f5f7; padding-bottom: 40px; padding-top: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-collapse: collapse; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background-color: #4f46e5; padding: 40px 32px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; }
        .content { padding: 40px 32px; background-color: #ffffff; }
        .content p { color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px; }
        .content p.highlight { font-size: 18px; font-weight: 600; color: #111827; }
        .btn-container { text-align: center; margin: 24px 0; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 6px; }
        .footer { background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #f3f4f6; }
        .footer p { font-size: 13px; color: #9ca3af; margin: 0; }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main" width="100%">
          <tr>
            <td class="header">
              <h1>Reset Your Password</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <p class="highlight">Hi ${user.name},</p>
              <p>We received a request to reset the password for your account. You can do this by clicking the button below:</p>
              <div class="btn-container">
                <a href="${resetUrl}" class="btn">Reset Password</a>
              </div>
              <p>This link is highly secure and will expire automatically in 15 minutes.</p>
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; font-size: 14px; color: #6b7280;">${resetUrl}</p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
  await sendEmail({
    email,
    subject: "Password Reset Request 🔑",
    body: emailHtmlBody,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "A reset link has been sent.",
  });
};

const resetPassword = async (req, res) => {
  const { token, id } = req.params;
  const { newPassword } = req.body;

  if (!id || !token || !newPassword) {
    throw new CustomAPIError("Missing required details", StatusCodes.BAD_REQUEST);
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error:
        "Password must be at least 8 characters long and include at least one letter, one number, and one special character.",
    });
  }

  const incomingTokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const tokenQuery = `
    SELECT pr.id, pr.user_id, u.name, u.email 
    FROM password_resets pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.user_id = $1 AND pr.token_hash = $2 AND pr.expires_at > NOW()
  `;
  const tokenResult = await pool.query(tokenQuery, [id, incomingTokenHash]);
  const userRecord = tokenResult.rows[0];

  if (!userRecord) {
    throw new CustomAPIError("The reset link is invalid or has expired", StatusCodes.BAD_REQUEST);
  }
  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(newPassword, salt);

  const updatePasswordQuery = `
    UPDATE users 
    SET password_hash = $1, updated_at = NOW()::timestamp 
    WHERE id = $2
  `;
  await pool.query(updatePasswordQuery, [newHashedPassword, id]);

  const clearTokensQuery = `DELETE FROM password_resets WHERE user_id = $1`;
  await pool.query(clearTokensQuery, [id]);

  
    const confirmationEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed Successfully</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; }
        .wrapper { width: 100%; background-color: #f4f5f7; padding: 40px 0; }
        .main { background-color: #ffffff; margin: 0 auto; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-collapse: collapse; overflow: hidden; }
        .header { background-color: #10b981; padding: 40px 32px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; }
        .content { padding: 40px 32px; background-color: #ffffff; }
        .content p { color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px; }
        .alert-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px; }
        .alert-box p { color: #991b1b; margin: 0; font-size: 14px; }
        .footer { background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #f3f4f6; }
        .footer p { font-size: 13px; color: #9ca3af; margin: 0; }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main" width="100%">
          <tr>
            <td class="header">
              <h1>Password Updated! Security Notice</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <p>Hi ${userRecord.name},</p>
              <p>This is a quick security confirmation that the password for your account was successfully changed just now.</p>
              <p>You can now log back into the dashboard using your updated credentials.</p>
              <div class="alert-box">
                <p><strong>Didn't make this change?</strong> If you did not request a password reset, your account may have been compromised. Please contact our support team immediately to lock your account.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;

  await sendEmail({
    email: userRecord.email,
    subject: "Your password was securely updated! ✔️",
    body: confirmationEmailHtml,
  });
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Password updated successfully! A confirmation email has been dispatched.",
  });
};

module.exports = {
  register,
  createStaffUser,
  login,
  forgotPassword,
  resetPassword,
};