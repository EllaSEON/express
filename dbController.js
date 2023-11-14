const fs = require("fs");

const readDB = (path) => {
  try {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
  } catch (err) {
    console.error(err);
  }
};

const writeDB = (path, data) => {
  try {
    return fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  readDB,
  writeDB,
};
