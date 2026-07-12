const jwt = require("jsonwebtoken");
const { CustomAPIError } = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");

const auth = (req, res, next) => {
  //check headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomAPIError(
      "Invalid Authentication",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //attach the user to the next route
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    throw new CustomAPIError(
      "Invalid Authentication",
      StatusCodes.UNAUTHORIZED,
    );
  }
};

module.exports = auth;
