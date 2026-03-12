import express from "express";
import fs from "node:fs";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport.js";
import path from "path";
import { notFound, errorHandler } from "./middleware/errorsHandler.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import teamRoutes from "./routes/teams.js";
import contentRoutes from "./routes/content.js";
import mediaRoutes from "./routes/media.js";
import contactRoutes from "./routes/contacts.js";
import analyticsRoutes from "./routes/analytics.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import config from "./config/environment.js";
import setupSwagger from "./config/swagger.js";
import User from "./models/User.js";
import Event from "./models/Event.js";
import Team from "./models/Team.js";
import Content from "./models/Content.js";
import Media from "./models/Media.js";
import Contact from "./models/Contact.js";
import AnalyticsEvent from "./models/AnalyticsEvent.js";
import Donation from "./models/Donation.js";

const app = express();
const apiLandingPageTemplate = fs.readFileSync(
  path.join(process.cwd(), "templates", "api-landing.html"),
  "utf8",
);

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000"],
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const apiRouteDefinitions = [
  { basePath: "/api/auth", router: authRoutes, tag: "Auth", model: User },
  {
    basePath: "/api/users",
    router: userRoutes,
    tag: "Users",
    model: User,
  },
  {
    basePath: "/api/events",
    router: eventRoutes,
    tag: "Events",
    model: Event,
  },
  {
    basePath: "/api/teams",
    router: teamRoutes,
    tag: "Teams",
    model: Team,
  },
  {
    basePath: "/api/content",
    router: contentRoutes,
    tag: "Content",
    model: Content,
  },
  {
    basePath: "/api/media",
    router: mediaRoutes,
    tag: "Media",
    model: Media,
  },
  {
    basePath: "/api/contacts",
    router: contactRoutes,
    tag: "Contacts",
    model: Contact,
  },
  {
    basePath: "/api/analytics",
    router: analyticsRoutes,
    tag: "Analytics",
    model: AnalyticsEvent,
  },
  {
    basePath: "/api/payment",
    router: paymentRoutes,
    tag: "Payment",
    model: Donation,
  },
];

for (const routeDef of apiRouteDefinitions) {
  app.use(routeDef.basePath, routeDef.router);
}

setupSwagger(app, apiRouteDefinitions);

app.get("/", (req, res) => {
  const clientUrl = config.CLIENT_URL || "http://localhost:3000";

  res
    .type("html")
    .send(apiLandingPageTemplate.replaceAll("__CLIENT_URL__", clientUrl));
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check backend health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Health check details
 */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
