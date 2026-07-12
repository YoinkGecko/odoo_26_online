const fs = require("fs");
const path = require("path");

const logger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    const time = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const log = `
      [${time}]
      Method      : ${req.method}
      URL         : ${req.originalUrl}
      Status Code : ${res.statusCode}
      IP Address  : ${req.ip}
      User Agent  : ${req.get("User-Agent")}
      Response    : ${responseTime}ms
      ---------------------------------------
      `;

    console.log(log);

    fs.appendFile(path.join(__dirname, "../logs/access.log"), log, (err) => {
      if (err) {
        console.error("Error writing log:", err);
      }
    });
  });

  next();
};

module.exports = logger;
