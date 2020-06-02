const vscode = require('vscode');

const util = {
  sortObj(propertyName, sortType = 'asce') {
    return (obj1, obj2) => {
      let val1 = Number(obj1[propertyName]);
      let val2 = Number(obj2[propertyName]);
      if (val2 < val1) {
        return sortType === 'asce' ? -1 : 1;
      } else if (val2 > val1) {
        return sortType === 'asce' ? 1 : -1;
      } else {
        return 0;
      }
    }
  },
  getConfigurationTime() {
    const config = vscode.workspace.getConfiguration();
    return config.get('btc-price-watch-interval');
  },
  getConfigurationCoinList() {
    const config = vscode.workspace.getConfiguration();
    return config.get('btc-price-watch-list');
  },
  getCoinInfo(symbol) {
    let trading;
    if (symbol.substr(-3) === 'ETH') {
        trading = 'ETH';
    } else if (symbol.substr(-3) === 'BTC') {
        trading = 'BTC';
    } else if (symbol.substr(-4) === 'USDT') {
        trading = 'USDT';
    }
    return [symbol.split('-')[0], trading];
  }
}

module.exports = util;