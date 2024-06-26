const path = require("node:path");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");

async function logError(errorName, error) {
  try {
    const logDirPath = path.join(__dirname, "..", "..", "logs");
    const logFilePath = path.join(logDirPath, `${errorName}.log`);

    if (!fs.existsSync(logDirPath)) {
      await fsPromises.mkdir(logDirPath);
    }

    const data = `Error Name: [${errorName}]\tTime: ${new Date().toISOString()}\n${
      error.stack
    }\n\n`;

    if (!fs.existsSync(logFilePath)) {
      await fsPromises.writeFile(logFilePath, data, "utf8");
    } else {
      await fsPromises.appendFile(logFilePath, data, "utf8");
    }
  } catch (err) {
    console.error("Error during log operation:", err);
  }
}

exports.logError = logError;
