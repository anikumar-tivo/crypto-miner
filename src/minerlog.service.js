const md5 = require("md5");

module.exports = class MinerLogService {
  #logs;
  static MAX_LOG_LINE_LIMIT = 200;

  constructor() {
    this.#logs = { lineHashes: [], lines: [] };
  }

  onMessageHandler = (data) => {
    const lines = data.toString().split("\n");
    for (let line of lines) {
      if (line === "") continue;
      if (this.#logs.lines.length > MinerLogService.MAX_LOG_LINE_LIMIT) {
        this.#logs.lines.shift();
        this.#logs.lineHashes.shift();
      }
      this.#logs.lines.push(line);
      this.#logs.lineHashes.push(md5(line));
    }
  };

  flushAll = () => {
    this.#logs = this.#logs = { lineHashes: [], lines: [] };
  };

  getLogsByHash = (hash) => {
    const fromIndex = this.#logs.lineHashes.indexOf(hash) + 1;
    const logs = this.#logs.lines.slice(fromIndex);
    let next = hash;
    if (logs.length !== 0) {
      next = md5(logs[logs.length - 1]);
    }
    return { hash: next, lines: logs };
  };
};
