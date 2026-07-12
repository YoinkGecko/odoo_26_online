//basic imports
const express = require("express");
const app = express();
require("dotenv").config();
// require('express-async-errors') only for express 4 from express 5 it is built in
const pool = require("./db/connect");

//extra security packages
const helmet = require("helmet");
const cors = require("cors");
//const xss = require("xss-clean");
const rateLimiterLib = require("express-rate-limit");

//erro middleware
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

//other middleware
const logger = require("./middleware/logger");
const rateLimiter = require("./middleware/rate-limiter");
const auth = require("./middleware/authentication");

//routers

app.use(
  rateLimiterLib({
    windowMs: 15 * 60 * 100, //15 min
    max: 100,
  }),
);
app.use(express.json());
app.use(helmet());
app.use(cors());
//app.use(xss());

//app.use(express.static('./public'));
app.use(logger);
app.use(rateLimiter);

//routes
app.get("/ping", (req, res) => {
  res.status(200).send("PONG");
});

//app.use("/api/v1/auth", authRouter); 

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    pool
      .connect()
      .then(() => {
        console.log("Connected to PostgreSQL");
      })
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.log("Failed to start the server", err);
  }
};

start();
