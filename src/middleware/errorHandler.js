import createHttpError from "http-errors";
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let errorMessage = "An unknown error occured";
  if (createHttpError.isHttpError(err)) {
    statusCode = err.status;
    errorMessage = err.message;
  }

  res.status(statusCode).json({ error: errorMessage });
};
export default errorHandler;
