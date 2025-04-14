import videoRouter from "./video.js";
import fileRouter from "./file.js";
import adminRouter from "./admin.js";
export default function route(app) {
  app.use("/", videoRouter);
  app.use("/file", fileRouter);
  app.use("/admin", adminRouter);
}
