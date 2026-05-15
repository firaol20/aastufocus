import { call, put, takeLatest } from "redux-saga/effects";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  logout,
  setUser,
  googleRequest,
  verifyEmailRequest,
  verifyEmailSuccess,
  verifyEmailFailure,
  resendVerificationRequest,
  resendVerificationSuccess,
  resendVerificationFailure,
} from "./index";
import { UserType } from "./types";
import { SagaIterator } from "redux-saga";
import makeCall from "@/lib/api/makeCall";
import { apiRoutes } from "@/lib/api";
import { RegisterPayload, LoginPayload, VerifyEmailPayload, ResendVerificationPayload } from "./types";
import { ToastService } from "@/lib/services/toastService";

// Util for storing/removing token/user in localStorage
const persistAuth = (user: UserType | null, token: string | null) => {
  if (user && token) {
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  }
};

// Login Saga
function* loginSaga(action: {
  type: string;
  payload: LoginPayload;
}): SagaIterator {
  try {
    const response = yield call(makeCall, {
      route: apiRoutes.auth.login,
      method: "POST",
      body: action.payload,
      isSecureRoute: false,
    });

    if (response.success) {
      ToastService.success(response.message || "Login successful!");
    }

    // Validate response
    if (!response.data?.user || !response.data?.accessToken) {
      throw new Error("Invalid login response");
    }

    const { user, accessToken: token } = response.data;
    yield put(loginSuccess({ user, token }));
    persistAuth(user, token);
  } catch (error: any) {
    const errorMessage =
      error?.message ||
      "Login failed";

    ToastService.error(errorMessage);
    yield put(loginFailure(error?.message || "Login failed"));
    persistAuth(null, null);
  }
}

// Register Saga
function* registerSaga(action: {
  type: string;
  payload: RegisterPayload;
}): SagaIterator {
  try {
    const response = yield call(makeCall, {
      route: apiRoutes.auth.register,
      method: "POST",
      body: action.payload,
      isSecureRoute: false,
    });

    if (response.success) {
      ToastService.success(response.message || "Registration successful!");
    }

    const { user, token } = response.data;
    yield put(registerSuccess({ user, token }));
    persistAuth(user, token);
  } catch (error: any) {
    ToastService.error(
      error?.response?.data?.message || error.message || "Registration failed"
    );
    yield put(registerFailure(error?.response?.data?.message || error.message));
    persistAuth(null, null);
  }
}

// Refresh Token Saga
function* refreshTokenSaga(): SagaIterator {
  try {
    const response = yield call(makeCall, {
      route: apiRoutes.auth.refreshToken,
      method: "POST",
      isSecureRoute: true,
    });

    const token = response.data?.data?.token || response.data?.token;
    yield put(refreshTokenSuccess(token));
    localStorage.setItem("auth_token", token);
    ToastService.success("Session refreshed successfully!");
  } catch (error: any) {
    ToastService.error(
      error?.response?.data?.message ||
        error.message ||
        "Session refresh failed"
    );
    yield put(
      refreshTokenFailure(error?.response?.data?.message || error.message)
    );
    persistAuth(null, null);
  }
}

// Logout Saga
function* logoutSaga(): SagaIterator {
  try {
    const response = yield call(makeCall, {
      route: apiRoutes.auth.logout,
      method: "POST",
      isSecureRoute: true,
    });

    if (response.success) {
      ToastService.success(response.message || "Logged out successfully!");
    }
  } catch (error: any) {
    ToastService.error(
      error?.response?.data?.message || error.message || "Logout failed"
    );
  } finally {
    persistAuth(null, null);
  }
}

// Verify Email Saga
function* verifyEmailSaga(action: {
  type: string;
  payload: VerifyEmailPayload;
}): SagaIterator {
  try {
    const response = yield call(makeCall, {
      route: apiRoutes.auth.verifyEmail,
      method: "POST",
      body: action.payload,
      isSecureRoute: false,
    });

    if (response.success) {
      yield put(verifyEmailSuccess());
      ToastService.success(response.message || "Email verified successfully!");
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error.message || "Verification failed";
    ToastService.error(errorMessage);
    yield put(verifyEmailFailure(errorMessage));
  }
}

// Resend Verification Saga
function* resendVerificationSaga(action: {
  type: string;
  payload: ResendVerificationPayload;
}): SagaIterator {
  try {
    const response = yield call(makeCall, {
      route: apiRoutes.auth.resendVerification,
      method: "POST",
      body: action.payload,
      isSecureRoute: false,
    });

    if (response.success) {
      yield put(resendVerificationSuccess());
      ToastService.success(response.message || "New verification code sent!");
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error.message || "Failed to resend code";
    ToastService.error(errorMessage);
    yield put(resendVerificationFailure(errorMessage));
  }
}

function* googleSaga(): SagaIterator {
  try {
    ToastService.success("Rediredting to Google...");
  } catch (error: any) {
    ToastService.error(error?.message || "Google auth failed")
  }
}

// Bootstrap user from localStorage on app init
function* initializeAuthSaga() {
  const userStr = localStorage.getItem("auth_user");
  const token = localStorage.getItem("auth_token");

  if (userStr && token) {
    const user = JSON.parse(userStr) as UserType;
    yield put(setUser(user));
    yield put(refreshTokenRequest());
  } else {
    yield put(setUser(null));
  }
}

// Watcher
export default function* authSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(registerRequest.type, registerSaga);
  yield takeLatest(refreshTokenRequest.type, refreshTokenSaga);
  yield takeLatest(logout.type, logoutSaga);
  yield takeLatest(googleRequest.type, googleSaga);
  yield takeLatest(verifyEmailRequest.type, verifyEmailSaga);
  yield takeLatest(resendVerificationRequest.type, resendVerificationSaga);
}
