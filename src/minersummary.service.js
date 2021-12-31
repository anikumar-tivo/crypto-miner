const request = require("request");

module.exports = class MinerSummaryService {
  #endpoint;
  #summary;

  constructor(port) {
    this.#summary = {};
    this.#endpoint = `http://localhost:${port}/2/summary`;
  }

  _fetchUrl = (uri, pMethod = "GET", pHeaders = {}, pBody = null) => {
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
      uri: uri,
    };

    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        if (error) reject(error);
        else resolve(JSON.parse(body));
      });
    });
  };

  _createSummary = (data) => {
    const oResults = {};
    const iAccepted = data.connection.accepted;
    const iRejected = data.connection.rejected;
    const fPercent = (iAccepted * 100) / (iAccepted + iRejected);
    oResults.accepted = `${iAccepted}/${iRejected} (${
      Math.round(fPercent * 10) / 10
    }%)`;

    const iHashesTotal = data.connection.hashes_total;
    const iDiff = data.connection.diff;
    oResults.poolSideHashes = `${iHashesTotal} avg ${iDiff}`;

    oResults.difficulty = data.results.diff_current;
    const iAvgTime = data.results.avg_time_ms / 1000;
    oResults.avgResultTime = `${Math.round(iAvgTime * 10) / 10}s`;

    const oHashRate = {};
    oHashRate.m10shs = Math.round(data.hashrate.total[0] * 10) / 10;
    oHashRate.m60shs = Math.round(data.hashrate.total[1] * 10) / 10;
    oHashRate.m15mhs = Math.round(data.hashrate.total[2] * 10) / 10;
    oHashRate.maxhs = Math.round(data.hashrate.highest * 10) / 10;

    this.#summary = { results: oResults, hashrate: oHashRate };
  };

  getSummary = () => {
    return new Promise((resolve, reject) => {
      this._fetchUrl(this.#endpoint)
        .then((result) => {
          this._createSummary(result);
          resolve(this.#summary);
        })
        .catch((error) => reject(error));
    });
  };
};
