import "dotenv/config";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import searchRoutes from "./routes/search.js";
import libraryRoutes from "./routes/library.js";

const app = new Hono<{
  Variables: {
    userId: string | null;
    username: string | null;
  };
}>();

app.use("*", authMiddleware);

app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (p) => p.replace(/^\/static/, "") }));
app.use("/assets/*", serveStatic({ root: "./public/dist" }));

app.route("/auth", authRoutes);
app.route("/search", searchRoutes);
app.route("/library", libraryRoutes);

// serve react app for all non-api routes
app.get("*", serveStatic({ path: "./public/dist/index.html" }));

const port = parseInt(process.env.PORT ?? "3000", 10);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
