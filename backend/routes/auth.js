import express from "express";
import crypto from "crypto";
import passport from "../config/passport.js";
import { signAccessToken, generateRefreshToken, persistRefreshToken } from "../utils/tokenService.js";
import {
  loginSchema,
  registerSchema,
  validateRequest,
} from "../middleware/validation/index.js";
import {
  login,
  register,
  registerAdmin,
  verifyEmail,
  resendVerificationCode,
  refreshToken,
  logout,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/register/admin", validateRequest(registerSchema), registerAdmin);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// google
router.get(
  "/google",
  (req, res, next) => {
    const state = crypto.randomBytes(32).toString('hex');
    req.session.googleOAuthState = state;
    return passport.authenticate("google", {
      scope: ["profile", "email"],
      state,
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: process.env.CLIENT_URL || "http://localhost:3000" 
  }),
  async (req, res) => {
    try {
      // Verify CSRF state parameter
      const stateFromRequest = req.query.state;
      const stateFromSession = req.session?.googleOAuthState;
      const isProduction = process.env.NODE_ENV === 'production';

      if (
        isProduction && (
          !stateFromRequest || !stateFromSession || stateFromRequest !== stateFromSession
        )
      ) {
        console.error('Google OAuth: Invalid CSRF state parameter');
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}?auth=csrf_failed`);
      }

      // Validate req.user exists
      if (!req.user) {
        console.error('Google OAuth: No user in request');
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}?auth=failed`);
      }

      // Generate tokens for the authenticated user
      const access = signAccessToken(req.user);
      const refresh = generateRefreshToken();
      await persistRefreshToken(req.user._id, refresh);

      const commonCookie = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
      };

      res
        .cookie('access_token', access, { ...commonCookie, maxAge: 15 * 60 * 1000 })
        .cookie('refresh_token', refresh, { ...commonCookie, maxAge: 30 * 24 * 60 * 60 * 1000 })
        .redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/auth/callback?auth=success`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      res.redirect(`${clientUrl}/auth/callback?auth=error`);
    } finally {
      // Clean up session
      if (req.session) {
        req.session.googleOAuthState = null;
      }
    }
  }
);

export default router;
