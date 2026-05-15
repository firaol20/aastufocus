import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, RegisterPayload, UserType, VerifyEmailPayload, ResendVerificationPayload } from './types';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isRegistered: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login
    loginRequest(state, action: PayloadAction<{ email: string; password: string }>) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: UserType; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    // Google login
    googleRequest(state) {
      state.loading = true;
      state.error = null;
    },

    // Logout
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    // Register
    registerRequest(state, action: PayloadAction<RegisterPayload>) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action: PayloadAction<{ user: UserType; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = false;
      state.isRegistered = true;
      state.loading = false;
      state.error = null;
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Refresh Token
    refreshTokenRequest(state) {
      state.loading = true;
      state.error = null;
    },
    refreshTokenSuccess(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    refreshTokenFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    // Set user (load from localStorage or profile fetch)
    setUser(state, action: PayloadAction<UserType | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Set error
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    // Verify Email
    verifyEmailRequest(state, action: PayloadAction<VerifyEmailPayload>) {
      state.loading = true;
      state.error = null;
    },
    verifyEmailSuccess(state) {
      state.loading = false;
      state.error = null;
      state.isRegistered = false; // Reset registration state after successful verification
    },
    verifyEmailFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Resend Verification
    resendVerificationRequest(state, action: PayloadAction<ResendVerificationPayload>) {
      state.loading = true;
      state.error = null;
    },
    resendVerificationSuccess(state) {
      state.loading = false;
      state.error = null;
    },
    resendVerificationFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  registerRequest,
  registerSuccess,
  registerFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  setUser,
  setError,
  googleRequest,
  verifyEmailRequest,
  verifyEmailSuccess,
  verifyEmailFailure,
  resendVerificationRequest,
  resendVerificationSuccess,
  resendVerificationFailure,
} = authSlice.actions;

export default authSlice.reducer;