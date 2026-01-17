import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../../server/routes";
import { log } from "../../server/vite";

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// URL rewriting for Tailscale funnel: strip /ggl-app prefix (support dev + prod)
app.use((req, res, next) => {
  if (req.path.startsWith("/ggl-app")) {
    req.url = req.url.replace(/^\/ggl-app/, "") || "/";
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  // @ts-ignore
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    // @ts-ignore
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize routes
let initialized = false;

const handler = async (req: Request, res: Response) => {
  if (!initialized) {
    try {
      await registerRoutes(app);
      initialized = true;
    } catch (error) {
      console.error("Failed to initialize routes:", error);
      return res.status(500).json({ message: "Server initialization failed" });
    }
  }

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("Error:", err);
  });

  // Pass request to Express
  app(req, res);
};

export { handler };
