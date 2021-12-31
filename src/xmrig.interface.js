const { spawn } = require("child_process");

const CRYPTO_MINER_HOME = process.env.CRYPTO_MINER_HOME || ".";

module.exports = class XmrigInterface {
  #xmrig;
  #command;
  #onError;
  #onMessage;

  constructor(aXmrigHome, onMessageCallback) {
    this.#command = `${aXmrigHome}/xmrig -c ${aXmrigHome}/config.json`;
    this.#onError = onMessageCallback;
    this.#onMessage = onMessageCallback;
  }

  launch = () => {
    if (this.#xmrig) {
      this.#xmrig.kill("SIGINT");
      this.#xmrig = null;
    }
    this.#xmrig = spawn(this.#command, { shell: true, serialization: "json" });
    this.#xmrig.stdout.on("data", (data) => this.#onError(data));
    this.#xmrig.stderr.on("data", (data) => this.#onMessage(data));
    this.#xmrig.on("close", (code) => {
      console.log(`[INFO] child process exited with code ${code}`);
    });
  };

  stop = () => {
    if (this.#xmrig) {
      this.#xmrig.kill("SIGINT");
      this.#xmrig = null;
    }
  };
};
