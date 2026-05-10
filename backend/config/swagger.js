import path from "path";
import { timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "./environment.js";

const authMiddlewareNames = new Set([
  "verifyJWT",
  "requireAuth",
  "requireAdmin",
  "requireLeader",
]);

const shouldMarkRequired = (value) => {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (typeof value.required === "boolean") {
    return value.required;
  }

  if (Array.isArray(value.required)) {
    return Boolean(value.required[0]);
  }

  return false;
};

const mapMongooseTypeToOpenApi = (type) => {
  if (type === String) return { type: "string" };
  if (type === Number) return { type: "number" };
  if (type === Boolean) return { type: "boolean" };
  if (type === Date) return { type: "string", format: "date-time" };
  if (type === mongoose.Schema.Types.ObjectId) {
    return { type: "string", format: "objectId" };
  }
  if (type === mongoose.Schema.Types.Mixed) return { type: "object" };
  if (type === Object) return { type: "object" };

  return { type: "string" };
};

const convertDefinitionToSchema = (definition, options = {}) => {
  if (Array.isArray(definition)) {
    const firstItem = definition.length > 0 ? definition[0] : { type: String };
    return {
      type: "array",
      items: convertDefinitionToSchema(firstItem, options),
    };
  }

  if (definition instanceof mongoose.Schema) {
    return buildSchemaObjectFromDefinition(definition.obj, options);
  }

  if (!definition || typeof definition !== "object") {
    return { type: "string" };
  }

  if (definition.type) {
    const typeDef = definition.type;

    if (Array.isArray(typeDef)) {
      return {
        type: "array",
        items: convertDefinitionToSchema(
          typeDef[0] || { type: String },
          options,
        ),
      };
    }

    let result;

    if (typeDef && typeof typeDef === "object" && !typeDef.name) {
      result = buildSchemaObjectFromDefinition(typeDef, options);
    } else {
      result = mapMongooseTypeToOpenApi(typeDef);
    }

    if (Array.isArray(definition.enum) && definition.enum.length > 0) {
      result.enum = definition.enum;
    }

    if (typeof definition.minlength === "number") {
      result.minLength = definition.minlength;
    }

    if (typeof definition.maxlength === "number") {
      result.maxLength = definition.maxlength;
    }

    if (typeof definition.min === "number") {
      result.minimum = definition.min;
    }

    if (typeof definition.max === "number") {
      result.maximum = definition.max;
    }

    return result;
  }

  return buildSchemaObjectFromDefinition(definition, options);
};

const buildSchemaObjectFromDefinition = (schemaDefinition, options = {}) => {
  const properties = {};
  const required = [];

  for (const [key, value] of Object.entries(schemaDefinition || {})) {
    if (
      options.excludeSystemFields &&
      ["_id", "__v", "createdAt", "updatedAt"].includes(key)
    ) {
      continue;
    }

    properties[key] = convertDefinitionToSchema(value, options);

    if (shouldMarkRequired(value)) {
      required.push(key);
    }
  }

  const objectSchema = {
    type: "object",
    properties,
  };

  if (required.length > 0) {
    objectSchema.required = required;
  }

  return objectSchema;
};

const buildModelSchemas = (routeDefinitions = []) => {
  const schemas = {};
  const uniqueModels = new Map();

  for (const routeDef of routeDefinitions) {
    const modelFromRef = routeDef.model;
    if (modelFromRef && modelFromRef.schema && modelFromRef.modelName) {
      uniqueModels.set(modelFromRef.modelName, modelFromRef);
      continue;
    }

    if (
      typeof routeDef.modelName === "string" &&
      routeDef.modelName.length > 0 &&
      mongoose.models[routeDef.modelName]
    ) {
      uniqueModels.set(routeDef.modelName, mongoose.models[routeDef.modelName]);
    }
  }

  for (const [modelName, model] of uniqueModels.entries()) {
    if (!model || !model.schema) {
      continue;
    }

    const modelSchema = buildSchemaObjectFromDefinition(model.schema.obj, {
      excludeSystemFields: false,
    });
    const modelInputSchema = buildSchemaObjectFromDefinition(model.schema.obj, {
      excludeSystemFields: true,
    });

    schemas[modelName] = modelSchema;
    schemas[`${modelName}Input`] = modelInputSchema;
  }

  return schemas;
};

const normalizeSwaggerPath = (basePath, routePath) => {
  const toStringPath = (value) => {
    if (Array.isArray(value)) {
      return value[0] || "";
    }
    return typeof value === "string" ? value : "";
  };

  const raw = `${toStringPath(basePath)}${toStringPath(routePath)}`;
  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/$/, "") || "/";

  // Express params use :id while OpenAPI expects {id}.
  return withoutTrailingSlash.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
};

const buildAuthSecurity = () => [{ bearerAuth: [] }];

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(left || "", "utf8");
  const rightBuffer = Buffer.from(right || "", "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const requireSwaggerAuth = (req, res, next) => {
  const username = config.SWAGGER_USERNAME;
  const password = config.SWAGGER_PASSWORD;

  if (!username || !password) {
    return next();
  }

  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Docs"');
    return res.status(401).json({
      success: false,
      message: "Authentication required to access API documentation.",
    });
  }

  const decoded = Buffer.from(authorization.slice(6), "base64").toString(
    "utf8",
  );
  const separatorIndex = decoded.indexOf(":");

  if (separatorIndex === -1) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Docs"');
    return res.status(401).json({
      success: false,
      message: "Invalid authentication format.",
    });
  }

  const providedUsername = decoded.slice(0, separatorIndex);
  const providedPassword = decoded.slice(separatorIndex + 1);

  if (
    !safeCompare(providedUsername, username) ||
    !safeCompare(providedPassword, password)
  ) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Docs"');
    return res.status(401).json({
      success: false,
      message: "Invalid Swagger credentials.",
    });
  }

  next();
};

const routeHasAuthHandlers = (handlers = []) =>
  handlers.some((handler) =>
    authMiddlewareNames.has(handler?.name || handler?.handle?.name),
  );

const buildManualSchemas = () => ({
  // ── Generic responses ──────────────────────────────────────────────
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Authentication failed" },
    },
    required: ["success", "message"],
  },
  MessageResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" },
    },
    required: ["success", "message"],
  },
  HealthResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Server is running" },
      timestamp: { type: "string", format: "date-time" },
      environment: { type: "string", example: "development" },
    },
  },

  // ── Auth ────────────────────────────────────────────────────────────
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "member@aastufocus.com" },
      password: { type: "string", format: "password", example: "StrongPassword123!" },
    },
  },
  RegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "Abel Bekele" },
      email: { type: "string", format: "email", example: "abel@aastufocus.com" },
      password: { type: "string", format: "password", example: "StrongPassword123!" },
      department: { type: "string", example: "Software Engineering" },
      yearOfStudy: { type: "integer", example: 3 },
      phone: { type: "string", example: "+251900000000" },
    },
  },
  RefreshTokenRequest: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", format: "uuid", example: "7312ecb5-b9a3-4c99-83e1-e2cf420dea44" },
    },
  },
  AuthenticatedUser: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid", example: "7312ecb5-b9a3-4c99-83e1-e2cf420dea44" },
      name: { type: "string", example: "Abel Bekele" },
      email: { type: "string", format: "email", example: "abel@aastufocus.com" },
      role: { type: "string", enum: ["admin", "leader", "member"], example: "member" },
      avatar: { type: "string", nullable: true },
      department: { type: "string", example: "Software Engineering" },
      yearOfStudy: { type: "integer", example: 3 },
      phone: { type: "string", example: "+251900000000" },
      isActive: { type: "boolean", example: true },
      isVerified: { type: "boolean", example: true },
      lastLogin: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  AuthSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Login successful" },
      data: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/AuthenticatedUser" },
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MzEyZWNiNS1iOWEzLTRjOTktODNlMS1lMmNmNDIwZGVhNDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Nzg0MDMzODgsImV4cCI6MTc3ODQwNDI4OH0.exampleTokenSignature" },
          refreshToken: { type: "string", example: "867f00d398e040378e999c08500249872e4040e3492723c0b050f4a8b7c4d5e6" },
        },
      },
    },
  },
  TokenRefreshResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },
    },
  },

  // ── User ────────────────────────────────────────────────────────────
  UpdateProfileRequest: {
    type: "object",
    properties: {
      name: { type: "string", example: "Abel Bekele" },
      department: { type: "string", example: "Software Engineering" },
      yearOfStudy: { type: "integer", example: 3 },
      phone: { type: "string", example: "+251900000000" },
      avatar: { type: "string", example: "https://example.com/avatar.jpg" },
    },
  },
  ChangePasswordRequest: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: { type: "string", format: "password", example: "OldPassword123!" },
      newPassword: { type: "string", format: "password", example: "NewPassword456!" },
    },
  },

  // ── Event ───────────────────────────────────────────────────────────
  EventRequest: {
    type: "object",
    required: ["title", "description", "date", "startTime", "endTime", "location"],
    properties: {
      title: { type: "string", example: "Weekly Bible Study" },
      description: { type: "string", example: "Join us for our weekly Bible study session." },
      date: { type: "string", format: "date-time", example: "2026-06-15T00:00:00.000Z" },
      startTime: { type: "string", example: "09:00" },
      endTime: { type: "string", example: "11:00" },
      location: { type: "string", example: "AASTU Main Hall, Block C" },
      category: {
        type: "string",
        enum: ["worship", "bible_study", "prayer", "fellowship", "break_mission", "outreach", "training", "other"],
        example: "bible_study",
      },
      maxAttendees: { type: "integer", example: 50 },
      isPublic: { type: "boolean", example: true },
      tags: { type: "array", items: { type: "string" }, example: ["bible", "study", "weekly"] },
    },
  },
  EventRegistrationRequest: {
    type: "object",
    required: ["eventId"],
    properties: {
      eventId: { type: "string", format: "uuid", example: "3a2b1c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" },
    },
  },
  AttendanceRequest: {
    type: "object",
    required: ["eventId", "userId", "status"],
    properties: {
      eventId: { type: "string", format: "uuid" },
      userId: { type: "string", format: "uuid" },
      status: { type: "string", enum: ["registered", "attended", "cancelled"] },
    },
  },

  // ── Team ────────────────────────────────────────────────────────────
  TeamRequest: {
    type: "object",
    required: ["name", "description", "category"],
    properties: {
      name: { type: "string", example: "Worship Team" },
      description: { type: "string", example: "Leads worship during fellowship events." },
      category: {
        type: "string",
        enum: ["worship", "action_and_prayer", "ebenezer", "fellowship", "eleos", "media", "administration", "nathanim", "other"],
        example: "worship",
      },
      maxMembers: { type: "integer", example: 20 },
      isPublic: { type: "boolean", example: true },
      meetingDay: { type: "string", enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], example: "friday" },
      meetingTime: { type: "string", example: "18:00" },
      meetingLocation: { type: "string", example: "Block D, Room 201" },
      goals: { type: "array", items: { type: "string" }, example: ["Lead 10 worship sessions this semester"] },
    },
  },
  TeamMemberRequest: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", format: "uuid", example: "7312ecb5-b9a3-4c99-83e1-e2cf420dea44" },
      role: { type: "string", enum: ["member", "assistant_leader", "coordinator"], example: "member" },
    },
  },

  // ── Donation / Payment ──────────────────────────────────────────────
  PaymentInitRequest: {
    type: "object",
    required: ["donor", "amount", "purpose", "category"],
    properties: {
      donor: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", example: "Abel Bekele" },
          email: { type: "string", format: "email", example: "abel@aastufocus.com" },
          phone: { type: "string", example: "+251900000000" },
        },
      },
      amount: { type: "number", example: 100.00 },
      currency: { type: "string", example: "ETB" },
      purpose: {
        type: "string",
        enum: ["general_fund", "event_sponsorship", "building_fund", "mission_trip", "bible_study_materials", "youth_programs", "outreach_programs", "emergency_relief", "other"],
        example: "general_fund",
      },
      category: {
        type: "string",
        enum: ["tithe", "offering", "special_offering", "pledge", "memorial", "honorarium", "sponsorship", "other"],
        example: "offering",
      },
      notes: { type: "string", example: "Monthly offering" },
    },
  },

  // ── Contact ─────────────────────────────────────────────────────────
  ContactRequest: {
    type: "object",
    required: ["name", "email", "subject", "message"],
    properties: {
      name: { type: "string", example: "Abel Bekele" },
      email: { type: "string", format: "email", example: "abel@example.com" },
      subject: { type: "string", example: "Question about fellowship events" },
      message: { type: "string", example: "I would like to know more about joining the fellowship." },
    },
  },
  ContactStatusRequest: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["pending", "replied", "archived"], example: "replied" },
    },
  },
  BulkIdsRequest: {
    type: "object",
    required: ["contactIds"],
    properties: {
      contactIds: {
        type: "array",
        items: { type: "string", format: "uuid" },
        example: ["uuid-1", "uuid-2"],
      },
    },
  },

  // ── Content ─────────────────────────────────────────────────────────
  ContentRequest: {
    type: "object",
    required: ["key", "value", "type"],
    properties: {
      key: { type: "string", example: "hero_title" },
      value: { type: "object", example: { text: "Welcome to AASTU Focus Fellowship" } },
      type: { type: "string", example: "hero" },
    },
  },

  // ── Media ───────────────────────────────────────────────────────────
  MediaUpdateRequest: {
    type: "object",
    properties: {
      title: { type: "string", example: "Fellowship Sunday Photo" },
      tags: { type: "array", items: { type: "string" }, example: ["fellowship", "sunday"] },
    },
  },

  // ── Analytics ───────────────────────────────────────────────────────
  AnalyticsEventRequest: {
    type: "object",
    required: ["type"],
    properties: {
      type: { type: "string", example: "page_view" },
      metadata: { type: "object", example: { page: "/events", userId: "7312ecb5-..." } },
    },
  },
});



const buildManualPaths = () => ({
  // ── Auth ────────────────────────────────────────────────────────────
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login with email and password",
      description: "Returns accessToken + refreshToken in the JSON body and sets HttpOnly cookies. Copy data.accessToken into the Swagger Authorize dialog.",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } } },
      responses: {
        200: { description: "Authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccessResponse" } } } },
        401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a member account",
      description: "Creates a new member. An OTP is sent to the provided email for verification.",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } } },
      responses: {
        201: { description: "Account created — check email for OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
        400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/auth/register/admin": {
    post: {
      tags: ["Auth"],
      summary: "Register an admin account",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } } },
      responses: {
        201: { description: "Admin created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccessResponse" } } } },
        400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/auth/verify-email": {
    post: {
      tags: ["Auth"],
      summary: "Verify email with 6-digit OTP",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object", required: ["email", "otp"],
              properties: {
                email: { type: "string", format: "email", example: "abel@aastufocus.com" },
                otp: { type: "string", example: "382910" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Email verified", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
        400: { description: "Invalid or expired OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/auth/resend-verification": {
    post: {
      tags: ["Auth"],
      summary: "Resend verification OTP",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email", example: "abel@aastufocus.com" } } },
          },
        },
      },
      responses: {
        200: { description: "OTP sent", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
        404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/auth/refresh-token": {
    post: {
      tags: ["Auth"],
      summary: "Refresh access token",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenRequest" } } } },
      responses: {
        200: { description: "New tokens", content: { "application/json": { schema: { $ref: "#/components/schemas/TokenRefreshResponse" } } } },
        401: { description: "Invalid refresh token", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/auth/logout": {
    post: {
      tags: ["Auth"], summary: "Logout",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Logged out", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } } },
    },
  },
  "/api/auth/google": {
    get: {
      tags: ["Auth"], summary: "Start Google OAuth (open in browser, not Swagger)",
      description: "Navigate to this URL directly in a browser tab — it redirects to Google's consent screen.",
      responses: { 302: { description: "Redirect to Google OAuth" } },
    },
  },

  // ── Users ───────────────────────────────────────────────────────────
  "/api/users/profile": {
    get: {
      tags: ["Users"], summary: "Get current user profile",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "User profile", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthenticatedUser" } } } } },
    },
    put: {
      tags: ["Users"], summary: "Update current user profile",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProfileRequest" } } } },
      responses: {
        200: { description: "Profile updated", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthenticatedUser" } } } },
        400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/users/change-password": {
    put: {
      tags: ["Users"], summary: "Change password",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } } },
      responses: {
        200: { description: "Password changed", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
        400: { description: "Wrong current password", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/users": {
    get: {
      tags: ["Users"], summary: "Get all users (admin)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", example: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
        { name: "role", in: "query", schema: { type: "string", enum: ["admin", "leader", "member"] } },
        { name: "search", in: "query", schema: { type: "string" } },
      ],
      responses: { 200: { description: "List of users" } },
    },
  },

  // ── Events ──────────────────────────────────────────────────────────
  "/api/events": {
    get: {
      tags: ["Events"], summary: "Get all events",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", example: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
        { name: "category", in: "query", schema: { type: "string", enum: ["worship","bible_study","prayer","fellowship","break_mission","outreach","training","other"] } },
        { name: "upcoming", in: "query", schema: { type: "boolean" } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "sortBy", in: "query", schema: { type: "string", example: "date" } },
        { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
      ],
      responses: { 200: { description: "List of events" } },
    },
    post: {
      tags: ["Events"], summary: "Create an event (auth required)",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventRequest" } } } },
      responses: {
        201: { description: "Event created", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
        400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/events/{id}": {
    get: {
      tags: ["Events"], summary: "Get event by ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Event details" }, 404: { description: "Not found" } },
    },
    put: {
      tags: ["Events"], summary: "Update event",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventRequest" } } } },
      responses: { 200: { description: "Updated" }, 403: { description: "Forbidden" }, 404: { description: "Not found" } },
    },
    delete: {
      tags: ["Events"], summary: "Delete event",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Deleted" }, 403: { description: "Forbidden" } },
    },
  },
  "/api/events/register": {
    post: {
      tags: ["Events"], summary: "Register for an event",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventRegistrationRequest" } } } },
      responses: { 200: { description: "Registered" }, 400: { description: "Already registered or full" } },
    },
  },
  "/api/events/cancel": {
    post: {
      tags: ["Events"], summary: "Cancel event registration",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventRegistrationRequest" } } } },
      responses: { 200: { description: "Cancelled" } },
    },
  },
  "/api/events/attendance": {
    post: {
      tags: ["Events"], summary: "Mark attendance (organizer/admin)",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AttendanceRequest" } } } },
      responses: { 200: { description: "Attendance marked" }, 403: { description: "Forbidden" } },
    },
  },

  // ── Teams ───────────────────────────────────────────────────────────
  "/api/teams": {
    get: {
      tags: ["Teams"], summary: "Get all public teams",
      parameters: [
        { name: "category", in: "query", schema: { type: "string", enum: ["worship","action_and_prayer","ebenezer","fellowship","eleos","media","administration","nathanim","other"] } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer" } },
        { name: "limit", in: "query", schema: { type: "integer" } },
      ],
      responses: { 200: { description: "List of teams" } },
    },
    post: {
      tags: ["Teams"], summary: "Create a team",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TeamRequest" } } } },
      responses: { 201: { description: "Team created" }, 400: { description: "Already leading a team" } },
    },
  },
  "/api/teams/{id}": {
    get: {
      tags: ["Teams"], summary: "Get team by ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Team details" }, 404: { description: "Not found" } },
    },
    put: {
      tags: ["Teams"], summary: "Update team",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TeamRequest" } } } },
      responses: { 200: { description: "Updated" }, 403: { description: "Forbidden" } },
    },
    delete: {
      tags: ["Teams"], summary: "Delete team",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Deleted" } },
    },
  },
  "/api/teams/{id}/members": {
    post: {
      tags: ["Teams"], summary: "Add member to team",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TeamMemberRequest" } } } },
      responses: { 200: { description: "Member added" }, 400: { description: "Already a member or team full" } },
    },
  },
  "/api/teams/{id}/join": {
    post: {
      tags: ["Teams"], summary: "Join a public team",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Joined" }, 400: { description: "Not public or full" } },
    },
  },
  "/api/teams/{id}/leave": {
    post: {
      tags: ["Teams"], summary: "Leave a team",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Left team" } },
    },
  },

  // ── Contacts ────────────────────────────────────────────────────────
  "/api/contacts": {
    post: {
      tags: ["Contacts"], summary: "Submit a contact message (public)",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ContactRequest" } } } },
      responses: { 201: { description: "Message received" }, 400: { description: "Validation error" } },
    },
    get: {
      tags: ["Contacts"], summary: "List all contacts (admin/leader)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "status", in: "query", schema: { type: "string", enum: ["pending", "replied", "archived"] } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer" } },
        { name: "limit", in: "query", schema: { type: "integer" } },
      ],
      responses: { 200: { description: "List of contacts" } },
    },
  },
  "/api/contacts/{id}": {
    get: {
      tags: ["Contacts"], summary: "Get contact by ID",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Contact" }, 404: { description: "Not found" } },
    },
    delete: {
      tags: ["Contacts"], summary: "Delete contact",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Deleted" } },
    },
  },
  "/api/contacts/{id}/status": {
    put: {
      tags: ["Contacts"], summary: "Update contact status",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ContactStatusRequest" } } } },
      responses: { 200: { description: "Status updated" } },
    },
  },

  // ── Content ─────────────────────────────────────────────────────────
  "/api/content": {
    get: {
      tags: ["Content"], summary: "Get all content entries",
      parameters: [
        { name: "type", in: "query", schema: { type: "string", example: "hero" } },
        { name: "search", in: "query", schema: { type: "string" } },
      ],
      responses: { 200: { description: "Content list" } },
    },
    post: {
      tags: ["Content"], summary: "Create content entry (admin/leader)",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ContentRequest" } } } },
      responses: { 201: { description: "Created" }, 400: { description: "Validation error" } },
    },
  },
  "/api/content/{id}": {
    get: {
      tags: ["Content"], summary: "Get content by ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Content entry" }, 404: { description: "Not found" } },
    },
    put: {
      tags: ["Content"], summary: "Update content entry",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ContentRequest" } } } },
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      tags: ["Content"], summary: "Delete content entry",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Deleted" } },
    },
  },

  // ── Media ───────────────────────────────────────────────────────────
  "/api/media": {
    get: {
      tags: ["Media"], summary: "Get all media",
      parameters: [
        { name: "type", in: "query", schema: { type: "string", enum: ["image", "video", "audio", "document"] } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer" } },
        { name: "limit", in: "query", schema: { type: "integer" } },
      ],
      responses: { 200: { description: "Media list" } },
    },
    post: {
      tags: ["Media"], summary: "Upload a media file",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["file"],
              properties: {
                file: { type: "string", format: "binary" },
                title: { type: "string", example: "Fellowship Photo" },
                tags: { type: "string", example: "fellowship,photo" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Uploaded" }, 400: { description: "No file provided" } },
    },
  },
  "/api/media/{id}": {
    get: {
      tags: ["Media"], summary: "Get media by ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Media entry" }, 404: { description: "Not found" } },
    },
    put: {
      tags: ["Media"], summary: "Update media metadata",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MediaUpdateRequest" } } } },
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      tags: ["Media"], summary: "Delete media",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Deleted" } },
    },
  },

  // ── Payment ─────────────────────────────────────────────────────────
  "/api/payment/initialize": {
    post: {
      tags: ["Payment"], summary: "Initialize a donation payment via Chapa",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PaymentInitRequest" } } } },
      responses: {
        200: { description: "Checkout URL returned" },
        400: { description: "Missing required fields" },
      },
    },
  },
  "/api/payment/verify/{transactionId}": {
    get: {
      tags: ["Payment"], summary: "Verify a Chapa payment",
      parameters: [{ name: "transactionId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Verification result" } },
    },
  },
  "/api/payment/status/{donationId}": {
    get: {
      tags: ["Payment"], summary: "Get donation payment status",
      parameters: [{ name: "donationId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { 200: { description: "Donation status" }, 404: { description: "Not found" } },
    },
  },

  // ── Analytics ───────────────────────────────────────────────────────
  "/api/analytics/track": {
    post: {
      tags: ["Analytics"], summary: "Track an analytics event",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AnalyticsEventRequest" } } } },
      responses: { 200: { description: "Event recorded" } },
    },
  },

  // ── System ──────────────────────────────────────────────────────────
  "/health": {
    get: {
      tags: ["System"], summary: "Server health check",
      responses: { 200: { description: "Healthy", content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } } } },
    },
  },
});

const buildPathsFromRouters = (routeDefinitions = []) => {
  const paths = {};

  for (const routeDef of routeDefinitions) {
    const { basePath = "", router, tag = "API", modelName, model } = routeDef;
    const resolvedModelName = model?.modelName || modelName;
    let routerRequiresAuth = false;

    if (!router || !Array.isArray(router.stack)) {
      continue;
    }

    for (const layer of router.stack) {
      if (!layer.route) {
        if (authMiddlewareNames.has(layer?.name || layer?.handle?.name)) {
          routerRequiresAuth = true;
        }
        continue;
      }

      if (!layer.route || !layer.route.path || !layer.route.methods) {
        continue;
      }

      const fullPath = normalizeSwaggerPath(basePath, layer.route.path);
      const methods = Object.keys(layer.route.methods).filter(
        (method) => layer.route.methods[method],
      );

      if (!paths[fullPath]) {
        paths[fullPath] = {};
      }

      for (const method of methods) {
        const lowerMethod = method.toLowerCase();
        const operation = {
          tags: [tag],
          summary: `${method.toUpperCase()} ${fullPath}`,
          responses: {
            200: { description: "Successful response" },
            400: { description: "Bad request" },
            401: { description: "Unauthorized" },
            500: { description: "Server error" },
          },
        };

        if (routerRequiresAuth || routeHasAuthHandlers(layer.route.stack)) {
          operation.security = buildAuthSecurity();
        }

        const pathParamMatches = fullPath.match(/\{([A-Za-z0-9_]+)\}/g) || [];
        if (pathParamMatches.length > 0) {
          operation.parameters = pathParamMatches.map((match) => {
            const paramName = match.replace(/[{}]/g, "");
            return {
              name: paramName,
              in: "path",
              required: true,
              schema: { type: "string" },
            };
          });
        }

        if (
          resolvedModelName &&
          ["post", "put", "patch"].includes(lowerMethod)
        ) {
          operation.requestBody = {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: `#/components/schemas/${resolvedModelName}Input`,
                },
              },
            },
          };
        } else if (["post", "put", "patch"].includes(lowerMethod)) {
          operation.requestBody = {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          };
        }

        if (
          resolvedModelName &&
          ["get", "post", "put", "patch"].includes(lowerMethod)
        ) {
          const isCollectionGet =
            lowerMethod === "get" &&
            fullPath === normalizeSwaggerPath(basePath, "/");

          operation.responses[200].content = {
            "application/json": {
              schema: isCollectionGet
                ? {
                    type: "array",
                    items: {
                      $ref: `#/components/schemas/${resolvedModelName}`,
                    },
                  }
                : { $ref: `#/components/schemas/${resolvedModelName}` },
            },
          };
        }

        paths[fullPath][lowerMethod] = operation;
      }
    }
  }

  return paths;
};

const createSwaggerSpec = (routeDefinitions = []) => {
  const generatedPaths = buildPathsFromRouters(routeDefinitions);
  const generatedSchemas = buildModelSchemas(routeDefinitions);
  const manualSchemas = buildManualSchemas();
  const manualPaths = buildManualPaths();

  const options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: "AASTU Focus Fellowship API",
        version: "1.0.0",
        description:
          "API documentation for the AASTU Focus Fellowship backend. Use the Auth section to log in, then paste the returned JWT token into the Authorize dialog as a Bearer token when calling protected endpoints.",
      },
      tags: [
        {
          name: "Auth",
          description:
            "Authentication endpoints for email/password login, registration, token refresh, logout, and Google OAuth entry.",
        },
        {
          name: "Users",
          description:
            "Protected user management and profile endpoints. These require a valid access token.",
        },
        {
          name: "Events",
          description: "Event browsing and event management endpoints.",
        },
        {
          name: "Teams",
          description: "Team listing, membership, and management endpoints.",
        },
        {
          name: "Content",
          description: "Content publishing and retrieval endpoints.",
        },
        {
          name: "Media",
          description: "Media upload and management endpoints.",
        },
        {
          name: "Contacts",
          description: "Contact form submission and response tracking.",
        },
        {
          name: "Analytics",
          description: "Analytics and reporting endpoints.",
        },
        { name: "Payment", description: "Donation and payment endpoints." },
        { name: "System", description: "System status endpoints." },
      ],
      servers: [
        {
          url: "/",
          description: "Current backend origin",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          ...generatedSchemas,
          ...manualSchemas,
        },
      },
    },
    apis: [
      path.resolve(process.cwd(), "app.js"),
      path.resolve(process.cwd(), "routes/*.js"),
    ],
  };

  const jsdocSpec = swaggerJsdoc(options);

  return {
    ...jsdocSpec,
    components: {
      ...(jsdocSpec.components || {}),
      securitySchemes: {
        ...(jsdocSpec.components?.securitySchemes || {}),
      },
      schemas: {
        ...generatedSchemas,
        ...manualSchemas,
        ...(jsdocSpec.components?.schemas || {}),
      },
    },
    paths: {
      ...generatedPaths,
      ...manualPaths,
      ...(jsdocSpec.paths || {}),
    },
  };
};

const setupSwagger = (app, routeDefinitions = []) => {
  const swaggerSpec = createSwaggerSpec(routeDefinitions);

  app.use("/api-docs", requireSwaggerAuth, (req, res, next) => {
    // Swagger UI injects inline script/style, so relax CSP only for docs.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'",
    );
    next();
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "AASTU Focus Fellowship API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "list",
        tryItOutEnabled: true,
        requestInterceptor: (request) => {
          // Strip extra quotes that Swagger UI sometimes wraps around Bearer tokens
          if (request.headers.Authorization) {
            request.headers.Authorization = request.headers.Authorization.replace(
              /^Bearer\s+"(.+)"$/,
              "Bearer $1"
            );
          }
          return request;
        },
      },
    }),
  );

  app.get("/api-docs.json", requireSwaggerAuth, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
