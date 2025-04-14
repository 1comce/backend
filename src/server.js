import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import { limiter } from "./middleware/limiterHandler.js";
import { pool } from "./config/db/index.js";
import route from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import { ROOT_DIR } from "./utils/paths.js";
import flash from "connect-flash";
import session from "express-session";
const port = 5000;
const start = async () => {
  const app = express();
  dotenv.config();
  app.use(cors());
  // app.use(limiter);
  app.use(
    session({
      secret: "123456",
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
    })
  );
  app.use(flash());
  app.set("views", path.join(ROOT_DIR, "views"));
  app.set("view engine", "ejs");
  app.use(express.json({ limit: "50mb" }));
  app.use(express.raw({ type: "application/octet-stream", limit: "20mb" }));
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
    })
  );
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(
    express.static(path.join(__dirname, "..", "public"), {
      setHeaders: (res, path, stat) => {
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
      },
    })
  );
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.get("/test", async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM movies");
      console.log("test route was called");
      res.json(rows);
    } catch (error) {
      console.log(error);
    }
  });
  route(app);
  app.use(errorHandler);
  app.listen(port, () => {
    console.log(`AdminJS started on http://localhost:${port}/admin`);
  });
};
start();
