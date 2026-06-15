"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.forgotPassword = exports.googleCallback = exports.googleAuth = exports.getProfile = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const passport_1 = __importDefault(require("passport"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const nodemailer_1 = __importDefault(require("nodemailer"));
// Configure Nodemailer with Ethereal Email for testing
// In production, replace with real SMTP credentials
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'demetris.wiegand12@ethereal.email', // Replace with a real test account or env vars
        pass: 'NfJj3u9K2B6XwVvHkZ'
    }
});
function generateTokens(user) {
    const accessPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
    };
    const refreshPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'refresh',
    };
    const accessToken = jsonwebtoken_1.default.sign(accessPayload, env_1.env.jwt.secret, {
        expiresIn: env_1.env.jwt.expiresIn,
    });
    const refreshToken = jsonwebtoken_1.default.sign(refreshPayload, env_1.env.jwt.secret, {
        expiresIn: env_1.env.jwt.refreshExpiresIn,
    });
    return { accessToken, refreshToken };
}
async function storeRefreshToken(userId, refreshToken) {
    const tokenHash = (0, helpers_1.hashToken)(refreshToken);
    const decoded = jsonwebtoken_1.default.decode(refreshToken);
    const expiresAt = decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await (0, database_1.query)('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [userId, tokenHash, expiresAt]);
}
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, first_name, last_name, phone, role } = req.body;
    if (!email || !password || !first_name) {
        throw new types_1.AppError('Email, password, and first name are required', 400);
    }
    const existing = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
        throw new types_1.AppError('Email already registered', 409);
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const allowedRoles = ['customer', 'supplier'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';
    const result = await (0, database_1.query)(`INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, false)
     RETURNING *`, [email.toLowerCase(), passwordHash, first_name, last_name ?? null, phone ?? null, userRole]);
    const user = result.rows[0];
    const tokens = generateTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken);
    // Send Welcome Email
    try {
        const info = await transporter.sendMail({
            from: '"BuildMaster ERP" <noreply@buildmaster.com>',
            to: email,
            subject: "Welcome to BuildMaster ERP",
            text: `Hello ${first_name},\n\nYou have successfully registered and logged into BuildMaster ERP.\n\nThank you!`,
            html: `<p>Hello <b>${first_name}</b>,</p><p>You have successfully registered and logged into BuildMaster ERP.</p><p>Thank you!</p>`
        });
        console.log("Welcome email sent! Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
    }
    catch (emailError) {
        console.error("Error sending welcome email:", emailError);
    }
    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: (0, helpers_1.sanitizeUser)(user),
            ...tokens,
        },
    });
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new types_1.AppError('Email and password are required', 400);
    }
    const result = await (0, database_1.query)('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !user.password_hash) {
        throw new types_1.AppError('Invalid email or password', 401);
    }
    if (!user.is_active) {
        throw new types_1.AppError('Account is deactivated', 403);
    }
    const valid = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!valid) {
        throw new types_1.AppError('Invalid email or password', 401);
    }
    await (0, database_1.query)('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const tokens = generateTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken);
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: (0, helpers_1.sanitizeUser)(user),
            ...tokens,
        },
    });
});
exports.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken: token } = req.body;
    if (!token) {
        throw new types_1.AppError('Refresh token is required', 400);
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.env.jwt.secret);
    }
    catch {
        throw new types_1.AppError('Invalid or expired refresh token', 401);
    }
    if (payload.type !== 'refresh') {
        throw new types_1.AppError('Invalid token type', 401);
    }
    const tokenHash = (0, helpers_1.hashToken)(token);
    const stored = await (0, database_1.query)('SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()', [payload.sub, tokenHash]);
    if (stored.rows.length === 0) {
        throw new types_1.AppError('Refresh token revoked or expired', 401);
    }
    const userResult = await (0, database_1.query)('SELECT * FROM users WHERE id = $1 AND is_active = true', [
        payload.sub,
    ]);
    const user = userResult.rows[0];
    if (!user) {
        throw new types_1.AppError('User not found', 404);
    }
    await (0, database_1.query)('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
    const tokens = generateTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken);
    res.json({
        success: true,
        data: tokens,
    });
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken: token } = req.body;
    if (token) {
        const tokenHash = (0, helpers_1.hashToken)(token);
        await (0, database_1.query)('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
});
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('SELECT id, email, first_name, last_name, phone, avatar_url, role, branch_id, is_verified, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) {
        throw new types_1.AppError('User not found', 404);
    }
    res.json({ success: true, data: user });
});
exports.googleAuth = passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});
const googleCallback = (req, res, next) => {
    passport_1.default.authenticate('google', { session: false }, async (err, user) => {
        try {
            if (err || !user) {
                return res.redirect(`${env_1.env.frontendUrl}/login?error=google_auth_failed`);
            }
            const tokens = generateTokens(user);
            await storeRefreshToken(user.id, tokens.refreshToken);
            const params = new URLSearchParams({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
            res.redirect(`${env_1.env.frontendUrl}/auth/callback?${params.toString()}`);
        }
        catch (error) {
            next(error);
        }
    })(req, res, next);
};
exports.googleCallback = googleCallback;
exports.forgotPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
    });
    if (!email)
        return;
    const result = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0)
        return;
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    // In production, store reset token with expiry and send email
    void resetToken;
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
        throw new types_1.AppError('Current and new password are required', 400);
    }
    if (new_password.length < 8) {
        throw new types_1.AppError('New password must be at least 8 characters', 400);
    }
    const result = await (0, database_1.query)('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user?.password_hash) {
        throw new types_1.AppError('Cannot change password for OAuth-only account', 400);
    }
    const valid = await bcryptjs_1.default.compare(current_password, user.password_hash);
    if (!valid) {
        throw new types_1.AppError('Current password is incorrect', 401);
    }
    const passwordHash = await bcryptjs_1.default.hash(new_password, 12);
    await (0, database_1.query)('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);
    await (0, database_1.query)('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
});
//# sourceMappingURL=auth.controller.js.map