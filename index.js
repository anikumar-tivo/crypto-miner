const os = require("os");
const express = require("express");
const bodyParser = require("body-parser");

const CryptoRes = require("./src/crypto.res");
const MinerConfig = require("./src/minerconfig");
const MinerLogService = require("./src/minerlog.service");
const MinerSummaryService = require("./src/minersummary.service");
const StateManager = require("./src/statemanager");
const UnminableService = require("./src/unmineable.service");
const XmrigInterface = require("./src/xmrig.interface");

const app = express();

const MINER_PORT = process.env.MINER_PORT || 8080;
const PORT = process.env.PORT || 3000;
const SHARE_DIR = process.env.SHARE_DIR || ".";
const XMRIG_HOME = process.env.XMRIG_HOME || ".";

const cryptoRes = new CryptoRes("./res/crypto.json");
const minerLogService = new MinerLogService(SHARE_DIR);
const minerConfig = new MinerConfig("./res/default.config.json");
const stateManager = new StateManager("./res/state.json");
const iXmrig = new XmrigInterface(XMRIG_HOME, minerLogService.onMessageHandler);

iXmrig.launch();

/**
 * App configurations.
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./src/views");

/**
 * The middleware.
 */
app.use((req, res, next) => {
  console.log(`${new Date()}  ${req.method}  ${req.url}  ${req.ip}`);
  next();
});

/**
 * Handle '/' or '/index'.
 */
app.get("/", (req, res) => {
  const config = stateManager.get("configurations") || {};
  const crypto = cryptoRes.getCryptoByCode(config.coin);
  res.render("index.ejs", {
    locals: {
      dashboardTab: true,
      state: {
        isfirst: stateManager.get("isfirst"),
        configurations: config,
      },
      crypto: crypto,
    },
  });
});

/**
 * Hanlde '/dashboard'
 */
app.get("/dashboard", (req, res) => {
  const config = stateManager.get("configurations") || {};
  const crypto = cryptoRes.getCryptoByCode(config.coin);
  res.render("index.ejs", {
    locals: {
      dashboardTab: true,
      state: {
        isfirst: stateManager.get("isfirst"),
        configurations: config,
      },
      crypto: crypto,
    },
  });
});

/**
 * Handle '/settings'
 */
app.get("/settings", (req, res) => {
  res.render("index.ejs", {
    locals: { settingsTab: true, cpus: os.cpus().length },
  });
});

app.post("/apply-settings", (req, res) => {
  const poolUrl = req.body["mining-pool"];
  const crypto = req.body["crypto-currency"];
  const walletAddress = req.body["wallet-address"];
  const worker = req.body["worker-name"];
  const donate = req.body["donate"];
  const cpus = req.body["cpus"];

  const stateConfigurations = {
    pool: poolUrl,
    coin: crypto,
    wallet: walletAddress,
    worker: worker,
    donate: donate || "off",
  };

  const useCpus = [];
  for (const cpu of cpus) useCpus.push(parseInt(cpu));
  if (useCpus.length === 0) useCpus.push(0);

  minerConfig.updatePoolUrl(poolUrl);
  minerConfig.updatePoolUser(crypto, walletAddress, worker);
  if (donate === "on") minerConfig.turnOnDonation();
  else minerConfig.turnOffDonation();
  minerConfig.updateCpus(useCpus);
  minerConfig.saveConfig();
  stateManager.set("isfirst", false);
  stateManager.set("configurations", stateConfigurations);
  iXmrig.stop();
  minerLogService.flushAll();
  iXmrig.launch();

  res.redirect("/dashboard");
});

/**
 * API to get the crypto currency icons
 */
app.get("/api/icons/:crypto", (req, res) => {
  const crypto = req.params.crypto;
  const info = cryptoRes.getCryptoByCode(crypto) || {};
  res.json({ icon: info.icon });
});

/**
 * API to get the sumary.
 */
app.get("/api/miner/summary", (req, res) => {
  const mService = new MinerSummaryService(MINER_PORT);
  mService
    .getSummary()
    .then((summary) => {
      res.json(summary);
    })
    .catch((error) => {
      res.json({ message: "failed to get the summary." });
    });
});

/**
 * API to get the wallet balance from unmineable.com
 */
app.get("/api/unmineable/balance/:coin/:wallet", (req, res) => {
  const coin = req.params.coin;
  const wallet = req.params.wallet;
  const mService = new UnminableService(coin, wallet);
  mService
    .getWalletBalance()
    .then((balance) => {
      res.json(balance);
    })
    .catch((error) => {
      res.json({ message: "failed to get the wallet balance." });
    });
});

/**
 * API to get the miner logs
 */
app.get("/api/miner/logs", (req, res) => {
  const hash = req.query.hash;
  res.json(minerLogService.getLogsByHash(hash));
});

/**
 * Start listening to request.
 */
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server is running on port ${PORT}`)
);
