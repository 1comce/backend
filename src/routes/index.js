import videoRouter from "./video.js";
export default function route(app) {
  app.use("/", videoRouter);
}
