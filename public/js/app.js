window.anikumar = (() => {
  /**
   * Settings
   */
  const minerSettings = document.querySelector("#miner-settings");
  const btnApply = document.querySelector("#btn-apply");
  const btnCancel = document.querySelector("#btn-cancel");
  const miningPool = document.querySelector("#mining-pool");
  const cryptoCurrencyIcon = document.querySelector("#crypto-currency-icon");
  const cryptoCurrency = document.querySelector("#crypto-currency");
  const walletAddress = document.querySelector("#wallet-address");
  const workerName = document.querySelector("#worker-name");
  const cpus = document.querySelectorAll('input[name="cpus"]');
  const donate = document.querySelectorAll("#donate");

  const _initSettingsTab = () => {
    if (cpus.length > 0) cpus[0].checked = true;

    btnCancel.addEventListener("click", () => {
      window.location = "/dashboard";
    });

    cryptoCurrency.addEventListener("change", (e) => {
      const url = `/api/icons/${e.target.value}`;
      _fetchUrl(url)
        .then((data) => {
          cryptoCurrencyIcon.src = data.icon;
        })
        .catch((error) => {
          console.error(error);
          cryptoCurrencyIcon.src = "";
        });
    });

    walletAddress.addEventListener("change", () => {
      _updateApplyBtnStatus();
    });

    workerName.addEventListener("change", () => {
      _updateApplyBtnStatus();
    });
  };

  const _updateApplyBtnStatus = () => {
    const hasValidAddress = walletAddress.value.length > 0;
    const hasValidWorker = workerName.value.length > 0;
    btnApply.disabled = !(hasValidAddress && hasValidWorker);
  };

  /**
   * Dashnoard
   */
  let minerInterval = null;
  let walletInterval = null;
  let logPreviewInterval = null;
  let logHash = null;
  const minerInfo = document.querySelector("#minner-info");
  const minedCoins = document.querySelector("#mined-coins");
  const accepted = document.querySelector("#accepted");
  const poolSideHashes = document.querySelector("#pool-side-hashes");
  const difficulty = document.querySelector("#difficulty");
  const avgResultTime = document.querySelector("#avg-result-time");
  const hashrate10shs = document.querySelector("#hashrate10shs");
  const hashrate60shs = document.querySelector("#hashrate60shs");
  const hashrate15mhs = document.querySelector("#hashrate15mhs");
  const hashratemaxhs = document.querySelector("#hashratemaxhs");
  const hiddenWalletAddress = document.querySelector("#hidden-wallet-address");
  const hiddenCoin = document.querySelector("#hidden-coin");
  const logPreview = document.querySelector("#log-preview");
  const waitingLogs = document.querySelector("#waiting-logs");
  const logLines = document.querySelector('#log-lines');

  const _initDashboardTab = () => {
    if (!minerInfo) return;
    if (minerInterval) clearInterval(interval);
    if (walletInterval) clearInterval(walletInterval);
    if (logPreviewInterval) clearInterval(logPreviewInterval);
    _refreshDashboard();
  };

  const _refreshDashboard = () => {
    _refreshMinerSummary();
    _refreshWalletBalance();
    minerInterval = setInterval(() => {
      _refreshMinerSummary();
    }, 10 * 1000);
    walletInterval = setInterval(() => {
      _refreshWalletBalance();
    }, 5 * 60 * 1000);
    logPreviewInterval = setInterval(() => {
      _updateLogPreview();
    }, 5 * 1000);
  };

  const _refreshMinerSummary = () => {
    _fetchUrl("/api/miner/summary")
      .then((summary) => {
        accepted.innerHTML = summary.results.accepted;
        poolSideHashes.innerHTML = summary.results.poolSideHashes;
        difficulty.innerHTML = summary.results.difficulty;
        avgResultTime.innerHTML = summary.results.avgResultTime;
        hashrate10shs.innerHTML = summary.hashrate.m10shs;
        hashrate60shs.innerHTML = summary.hashrate.m60shs;
        hashrate15mhs.innerHTML = summary.hashrate.m15mhs;
        hashratemaxhs.innerHTML = summary.hashrate.maxhs;
      })
      .catch((error) => console.error(error));
  };

  const _refreshWalletBalance = () => {
    _fetchUrl(
      `/api/unmineable/balance/${hiddenCoin.value}/${hiddenWalletAddress.value}`
    )
      .then((data) => {
        minedCoins.innerHTML = data.balance;
      })
      .catch((error) => console.error(error));
  };

  const _updateLogPreview = () => {
    _fetchUrl(`/api/miner/logs?hash=${logHash}`)
      .then((logs) => {
        if (!waitingLogs.hidden && logs.lines.length > 0) {
          waitingLogs.hidden = true;
        }
        logHash = logs.hash;
        for (let line of logs.lines) {
          let span = document.createElement("span");
          span.innerHTML = _addShellColors(line);
          span.classList = "log-line";
          logLines.appendChild(span);
          logLines.appendChild(document.createElement("br"));
        }
        logPreview.scrollTop = logPreview.scrollHeight;
      })
      .catch((error) => console.error(error));
  };

  const _addShellColors = (line = "") => {
    let cLine = line.replaceAll("\x1B", "");
    cLine = cLine.replaceAll("[0m", "</span>");
    // Background colors
    cLine = cLine.replaceAll('[40m[1;37m', '<span class="color-1-37m"><span class="color-40m">');
    cLine = cLine.replaceAll('[40;1m[1;37m', '<span class="color-1-37m"><span class="color-40-1m">');
    cLine = cLine.replaceAll('[40m', '<span class="color-40m">');
    cLine = cLine.replaceAll('[40;1m', '<span class="color-40-1m">');

    cLine = cLine.replaceAll('[41m[1;37m', '<span class="color-1-37m"><span class="color-41m">');
    cLine = cLine.replaceAll('[41;1m[1;37m', '<span class="color-1-37m"><span class="color-41-1m">');
    cLine = cLine.replaceAll('[41m', '<span class="color-41m">');
    cLine = cLine.replaceAll('[41;1m', '<span class="color-41-1m">');

    cLine = cLine.replaceAll('[42m[1;37m', '<span class="color-1-37m"><span class="color-4m">');
    cLine = cLine.replaceAll('[42;1m[1;37m', '<span class="color-1-37m"><span class="color-42-1m">');
    cLine = cLine.replaceAll('[42m', '<span class="color-42m">');
    cLine = cLine.replaceAll('[42;1m', '<span class="color-42-1m">');

    cLine = cLine.replaceAll('[43m[1;37m', '<span class="color-1-37m"><span class="color-43m">');
    cLine = cLine.replaceAll('[43;1m[1;37m', '<span class="color-1-37m"><span class="color-43-1m">');
    cLine = cLine.replaceAll('[43m', '<span class="color-43m">');
    cLine = cLine.replaceAll('[43;1m', '<span class="color-43-1m">');

    cLine = cLine.replaceAll('[44m[1;37m', '<span class="color-1-37m"><span class="color-44m">');
    cLine = cLine.replaceAll('[44;1m[1;37m', '<span class="color-1-37m"><span class="color-44-1m">');
    cLine = cLine.replaceAll('[44m', '<span class="color-44m">');
    cLine = cLine.replaceAll('[44;1m', '<span class="color-44-1m">');

    cLine = cLine.replaceAll('[45m[1;37m', '<span class="color-1-37m"><span class="color-45m">');
    cLine = cLine.replaceAll('[45;1m[1;37m', '<span class="color-1-37m"><span class="color-45-1m">');
    cLine = cLine.replaceAll('[45m', '<span class="color-45m">');
    cLine = cLine.replaceAll('[45;1m', '<span class="color-45-1m">');

    cLine = cLine.replaceAll('[46m[1;37m', '<span class="color-1-37m"><span class="color-46m">');
    cLine = cLine.replaceAll('[46;1m[1;37m', '<span class="color-1-37m"><span class="color-46-1m">');
    cLine = cLine.replaceAll('[46m', '<span class="color-46m">');
    cLine = cLine.replaceAll('[46;1m', '<span class="color-46-1m">');

    cLine = cLine.replaceAll('[47m[1;37m', '<span class="color-1-37m"><span class="color-47m">');
    cLine = cLine.replaceAll('[47;1m[1;37m', '<span class="color-1-37m"><span class="color-47-1m">');
    cLine = cLine.replaceAll('[47m', '<span class="color-47m">');
    cLine = cLine.replaceAll('[47;1m', '<span class="color-47-1m">');

    // Regular colors
    cLine = cLine.replaceAll("[0;30m", "<span class='color-0-30m'>");
    cLine = cLine.replaceAll("[0;31m", "<span class='color-0-31m'>");
    cLine = cLine.replaceAll("[0;32m", "<span class='color-0-32m'>");
    cLine = cLine.replaceAll("[0;33m", "<span class='color-0-33m'>");
    cLine = cLine.replaceAll("[0;34m", "<span class='color-0-34m'>");
    cLine = cLine.replaceAll("[0;35m", "<span class='color-0-35m'>");
    cLine = cLine.replaceAll("[0;36m", "<span class='color-0-36m'>");
    cLine = cLine.replaceAll("[0;37m", "<span class='color-0-37m'>");
    // Bold colors
    cLine = cLine.replaceAll("[1;30m", "<span class='color-1-30m'>");
    cLine = cLine.replaceAll("[1;31m", "<span class='color-1-31m'>");
    cLine = cLine.replaceAll("[1;32m", "<span class='color-1-32m'>");
    cLine = cLine.replaceAll("[1;33m", "<span class='color-1-33m'>");
    cLine = cLine.replaceAll("[1;34m", "<span class='color-1-34m'>");
    cLine = cLine.replaceAll("[1;35m", "<span class='color-1-35m'>");
    cLine = cLine.replaceAll("[1;36m", "<span class='color-1-36m'>");
    cLine = cLine.replaceAll("[1;37m", "<span class='color-1-37m'>");
    // Underline colors
    cLine = cLine.replaceAll("[4;30m", "<span class='color-4-30m'>");
    cLine = cLine.replaceAll("[4;31m", "<span class='color-4-31m'>");
    cLine = cLine.replaceAll("[4;32m", "<span class='color-4-32m'>");
    cLine = cLine.replaceAll("[4;33m", "<span class='color-4-33m'>");
    cLine = cLine.replaceAll("[4;34m", "<span class='color-4-34m'>");
    cLine = cLine.replaceAll("[4;35m", "<span class='color-4-35m'>");
    cLine = cLine.replaceAll("[4;36m", "<span class='color-4-36m'>");
    cLine = cLine.replaceAll("[4;37m", "<span class='color-4-37m'>");
    
    return cLine;
  };

  /**
   * Helpers
   */
  const _fetchUrl = (url, pMethod = "GET", pHeaders = {}, pBody = null) => {
    const mHeaders = Object.assign(
      {
        accept: "application/json",
        "cache-control": "no-cache",
      },
      pHeaders
    );

    const options = {
      headers: mHeaders,
      mode: "cors",
      method: pMethod,
      body: pBody,
    };

    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  };

  /**
   * Start
   */
  const _start = () => {
    if (minerSettings) {
      _initSettingsTab();
    } else {
      _initDashboardTab();
    }
  };

  return {
    start: _start,
  };
})();
