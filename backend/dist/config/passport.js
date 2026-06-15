"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const database_1 = require("./database");
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env_1.env.jwt.secret,
};
passport_1.default.use(new passport_jwt_1.Strategy(jwtOptions, async (payload, done) => {
    try {
        if (payload.type !== 'access') {
            return done(null, false);
        }
        const result = await (0, database_1.query)('SELECT id, email, first_name, last_name, role, branch_id, is_active FROM users WHERE id = $1', [payload.sub]);
        const user = result.rows[0];
        if (!user || !user.is_active) {
            return done(null, false);
        }
        const authUser = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            branch_id: user.branch_id,
        };
        return done(null, authUser);
    }
    catch (error) {
        return done(error, false);
    }
}));
if (env_1.env.google.clientId && env_1.env.google.clientSecret) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.google.clientId,
        clientSecret: env_1.env.google.clientSecret,
        callbackURL: env_1.env.google.callbackUrl,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('Google account has no email'), undefined);
            }
            const existing = await (0, database_1.query)('SELECT * FROM users WHERE email = $1 OR google_id = $2', [email, profile.id]);
            if (existing.rows[0]) {
                const user = existing.rows[0];
                if (!user.google_id) {
                    await (0, database_1.query)('UPDATE users SET google_id = $1, is_verified = true WHERE id = $2', [
                        profile.id,
                        user.id,
                    ]);
                }
                return done(null, existing.rows[0]);
            }
            const created = await (0, database_1.query)(`INSERT INTO users (email, google_id, first_name, last_name, avatar_url, role, is_verified, is_active)
             VALUES ($1, $2, $3, $4, $5, 'customer', true, true)
             RETURNING *`, [
                email,
                profile.id,
                profile.name?.givenName ?? 'User',
                profile.name?.familyName ?? '',
                profile.photos?.[0]?.value ?? null,
            ]);
            return done(null, created.rows[0]);
        }
        catch (error) {
            return done(error, undefined);
        }
    }));
}
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map