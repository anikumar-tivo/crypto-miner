const request = require("request");

module.exports = class UnminableService {
  #endpoint;

  constructor(coin, wallet) {
    // Example: https://api.unminable.com/v4/address/0x59bdcfeac3efb613f6b940660710b734b9a19d55?coin=SHIB
    this.#endpoint = `https://api.unminable.com/v4/address/${wallet}?coin=${coin}`;
  }

  getWalletBalance = () => {
    return new Promise((resolve, reject) => {
      console.log(this.#endpoint);
      this._fetchUrl(this.#endpoint)
        .then((result) => {
          resolve({ balance: result.data.balance });
        })
        .catch((error) => reject(error));
    });
  };

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
};
