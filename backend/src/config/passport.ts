import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { env } from './env';
import { query } from './database';
import { AuthUser, JwtPayload, User } from '../types';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt.secret,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      if (payload.type !== 'access') {
        return done(null, false);
      }

      const result = await query<User>(
        'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
        [payload.sub]
      );

      const user = result.rows[0];
      if (!user || !user.is_active) {
        return done(null, false);
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      };

      return done(null, authUser);
    } catch (error) {
      return done(error, false);
    }
  })
);

if (env.google.clientId && env.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile: Profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google account has no email'), undefined);
          }

          const existing = await query<User>(
            'SELECT * FROM users WHERE email = $1 OR google_id = $2',
            [email, profile.id]
          );

          if (existing.rows[0]) {
            const user = existing.rows[0];
            if (!user.google_id) {
              await query('UPDATE users SET google_id = $1, is_verified = true WHERE id = $2', [
                profile.id,
                user.id,
              ]);
            }
            return done(null, existing.rows[0]);
          }

          const created = await query<User>(
            `INSERT INTO users (email, google_id, first_name, last_name, avatar_url, role, is_verified, is_active)
             VALUES ($1, $2, $3, $4, $5, 'customer', true, true)
             RETURNING *`,
            [
              email,
              profile.id,
              profile.name?.givenName ?? 'User',
              profile.name?.familyName ?? '',
              profile.photos?.[0]?.value ?? null,
            ]
          );

          return done(null, created.rows[0]);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
