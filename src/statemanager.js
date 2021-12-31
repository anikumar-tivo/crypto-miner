const fs = require("fs");

module.exports = class StateManager {
  #state = null;
  #path = null;

  constructor(path) {
    this.#path = path;
    this.#state = JSON.parse(fs.readFileSync(path).toString());
  }

  get = (key) => {
    return this.#state[key];
  };

  set = (key, value) => {
    this.#state[key] = value;
    fs.writeFileSync(this.#path, JSON.stringify(this.#state, null, 4));
  };
};
