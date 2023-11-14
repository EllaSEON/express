const fs = require("fs").promises;
const resolve = require("resolve");

const basePath = resolve();

const filenames = {
  hashtags: resolve(basePath, "src/db/hashtags.json"),
  productHashtags: resolve(basePath, "src/db/productHashtags.json"),
  products: resolve(basePath, "src/db/products.json"),
};

const readDB = (target) => {
  try {
    return JSON.parse(fs.readFile(filenames[target], "utf-8"));
  } catch (err) {
    console.error(err);
  }
};

const writeDB = (target, data) => {
  try {
    return fs.writeFileSync(filenames[target], JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  readDB,
  writeDB,
};
