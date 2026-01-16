import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Only load vite in development mode
  if (process.env.NODE_ENV !== "development") {
    throw new Error("setupVite should only be called in development mode");
  }

  // Dynamically import vite - this prevents it from being bundled
  const vite = await (eval('import("vite")') as Promise<any>);
  const { createServer: createViteServer, createLogger } = vite;

  // Load config file without importing vite (config file is not bundled)
  const viteConfigPath = path.resolve(
    import.meta.dirname,
    "..",
    "vite.config.js",
  );
  let viteConfig: any = {};

  try {
    // Try to load the compiled vite.config.js
    const config = await (eval("import(viteConfigPath)") as Promise<any>);
    viteConfig = config.default || config;
  } catch (e) {
    // If config can't be loaded, use minimal defaults
    log("Warning: Could not load vite.config, using minimal setup");
  }

  const viteLogger = createLogger();

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const viteServer = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: any, options: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(viteServer.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production: dist/index.js runs from /app/dist, but frontend is at /app/server/public
  // In development: index.ts runs from /app/server, so frontend is at /app/server/public
  const distPath = process.env.NODE_ENV === "production"
    ? path.resolve(import.meta.dirname, "..", "server", "public")
    : path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Middleware to fix MIME types - runs BEFORE express.static
  app.use((req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    
    // Set correct MIME types based on file extension
    if (ext === ".css") {
      res.type("text/css");
    } else if (ext === ".js") {
      res.type("application/javascript");
    } else if (ext === ".json") {
      res.type("application/json");
    } else if (ext === ".png") {
      res.type("image/png");
    } else if (ext === ".jpg" || ext === ".jpeg") {
      res.type("image/jpeg");
    } else if (ext === ".gif") {
      res.type("image/gif");
    } else if (ext === ".svg") {
      res.type("image/svg+xml");
    }
    
    next();
  });

  // Serve static assets from /assets
  app.use("/assets", express.static(path.join(distPath, "assets"), {
    maxAge: "1y",
    etag: false,
  }));

  // Serve other static files (with fallthrough so SPA routes work)
  app.use("/", express.static(distPath, {
    maxAge: "1h",
    fallthrough: true,  // Call next() instead of sending 404
  }));

  // Catch-all: Route all other requests to index.html for SPA
  app.use((_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
