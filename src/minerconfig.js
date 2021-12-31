const fs = require("fs");

const XMRIG_HOME = process.env.XMRIG_HOME || ".";

module.exports = class MinerConfig {
  #minerConfig = null;

  constructor(configPath) {
    this.#minerConfig = JSON.parse(fs.readFileSync(configPath));
  }

  updatePoolUrl = (url) => {
    this.#minerConfig.pools[0].url = url;
  };

  updatePoolUser = (crypto, address, worker, referralCode = "tejt-ksat") => {
    this.#minerConfig.pools[0].user = `${crypto}:${address}.${worker}#${referralCode}`;
  };

  updateCpus = (cpus) => {
    this.#minerConfig.cpu["argon2"] = cpus;
    this.#minerConfig.cpu["astrobwt"] = cpus;
    this.#minerConfig.cpu["cn"] = cpus;
    this.#minerConfig.cpu["cn-heavy"] = cpus;
    this.#minerConfig.cpu["cn-lite"] = cpus;
    this.#minerConfig.cpu["cn-pico"] = cpus;
    this.#minerConfig.cpu["cn/upx2"] = cpus;
    this._updateGhostRider(cpus);
    this.#minerConfig.cpu["rx"] = cpus;
    this.#minerConfig.cpu["rx/wow"] = cpus;
  };

  _updateGhostRider = (cpus) => {
    const ghost = [];
    for (const cpu of cpus) ghost.push([8, cpu]);
    this.#minerConfig.cpu["ghostrider"] = ghost;
  };

  turnOffDonation = () => {
    this.#minerConfig["donate-level"] = 0;
    this.#minerConfig["donate-over-proxy"] = 0;
  };

  turnOnDonation = () => {
    this.#minerConfig["donate-level"] = 1;
    this.#minerConfig["donate-over-proxy"] = 1;
  };

  saveConfig = () => {
    fs.writeFileSync(
      `${XMRIG_HOME}/config.json`,
      JSON.stringify(this.#minerConfig, null, 4)
    );
  };
};
