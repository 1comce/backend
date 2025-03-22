const videoRouter = require("./video");
function route(app) {
  app.use("/", videoRouter);
}

module.exports = route;
