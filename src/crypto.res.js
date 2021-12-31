const fs = require("fs");

module.exports = class CryptoRes {
  #cryproRes = null;
  constructor(resPath) {
    this.#cryproRes = JSON.parse(fs.readFileSync(resPath).toString());
  }

  getCryptoByCode = (code) => {
    return this.#cryproRes[code];
  };
};
