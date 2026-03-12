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

const buildAuthSecurity = () => [{ bearerAuth: [] }, { cookieAuth: [] }];

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
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Authentication failed" },
      error: { type: "string", nullable: true },
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
    required: ["success", "message", "timestamp", "environment"],
  },
  LoginRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "member@aastufocus.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "StrongPassword123!",
      },
    },
    required: ["email", "password"],
  },
  RegisterRequest: {
    type: "object",
    properties: {
      name: { type: "string", example: "Abel Bekele" },
      email: {
        type: "string",
        format: "email",
        example: "abel@aastufocus.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "StrongPassword123!",
      },
      department: { type: "string", example: "Software Engineering" },
      yearOfStudy: { type: "number", example: 3 },
      phone: { type: "string", example: "+251900000000" },
    },
    required: ["name", "email", "password"],
  },
  AuthenticatedUser: {
    type: "object",
    properties: {
      _id: { type: "string", example: "67d0f4f8a1b2c3d4e5f67890" },
      name: { type: "string", example: "Abel Bekele" },
      email: {
        type: "string",
        format: "email",
        example: "abel@aastufocus.com",
      },
      role: { type: "string", enum: ["admin", "leader", "member"] },
      department: { type: "string", example: "Software Engineering" },
      yearOfStudy: { type: "number", example: 3 },
      phone: { type: "string", example: "+251900000000" },
      isActive: { type: "boolean", example: true },
      lastLogin: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      avatar: { type: "string", nullable: true },
    },
    required: ["_id", "name", "email", "role", "isActive"],
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
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
        required: ["user", "token"],
      },
    },
    required: ["success", "message", "data"],
  },
  RefreshTokenRequest: {
    type: "object",
    properties: {
      userId: { type: "string", example: "67d0f4f8a1b2c3d4e5f67890" },
    },
    required: ["userId"],
  },
  TokenRefreshResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Token refreshed" },
      data: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
        required: ["token"],
      },
    },
    required: ["success", "message", "data"],
  },
  MessageResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Logged out successfully" },
    },
    required: ["success", "message"],
  },
});

const buildManualPaths = () => ({
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login with email and password",
      description:
        "Authenticates a user, returns an access token in the JSON response, and also sets secure HTTP-only access and refresh token cookies. After a successful login, copy data.token into the Swagger Authorize dialog as a Bearer token when testing protected endpoints.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Authenticated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
            },
          },
        },
        401: {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a member account",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Account created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
            },
          },
        },
        400: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/auth/register/admin": {
    post: {
      tags: ["Auth"],
      summary: "Register an admin account",
      description:
        "Creates an admin user and returns an access token. This should typically be restricted outside development environments.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Admin account created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
            },
          },
        },
        400: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/auth/refresh-token": {
    post: {
      tags: ["Auth"],
      summary: "Refresh an expired access token",
      description:
        "Requires the refresh_token cookie set during login and the userId in the request body.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Token refreshed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TokenRefreshResponse" },
            },
          },
        },
        401: {
          description: "Refresh token missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Logout the current session",
      description: "Clears access and refresh token cookies.",
      responses: {
        200: {
          description: "Logout completed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessageResponse" },
            },
          },
        },
      },
    },
  },
  "/api/auth/google": {
    get: {
      tags: ["Auth"],
      summary: "Start Google OAuth login",
      description:
        "Redirects the browser to Google for authentication. This flow is browser-based and is better tested from the frontend login page than from Swagger.",
      responses: {
        302: {
          description: "Redirect to Google OAuth",
        },
      },
    },
  },
  "/health": {
    get: {
      tags: ["System"],
      summary: "Check backend health status",
      responses: {
        200: {
          description: "Health check details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HealthResponse" },
            },
          },
        },
      },
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
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "access_token",
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
      },
    }),
  );

  app.get("/api-docs.json", requireSwaggerAuth, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
