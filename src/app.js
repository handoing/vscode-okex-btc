const vscode = require('vscode');
const axios = require('axios');
const util = require('./util');
const { API_ADDRESS, OKEX_LINK } = require('./config/index');
const TreeProvider = require("./treeProvider");

class App {
    constructor(context){
        this.activateContext = context;
        this.statusBarItems = {};
        this.coins = util.getConfigurationCoinList();
        this.updateInterval = util.getConfigurationTime()
        this.timer = null;
        this.init();
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => this.handleConfigChange()));
    }
    handleConfigChange() {
        this.timer && clearInterval(this.timer);
        const codes = util.getConfigurationCoinList();
        Object.keys(this.statusBarItems).forEach((item) => {
            if (codes.indexOf(item) === -1) {
                this.statusBarItems[item].hide();
                this.statusBarItems[item].dispose();
                delete this.statusBarItems[item];
            }
        });
        this.init();
    }
    fetchAllData() {
        axios
          .get(API_ADDRESS)
          .then((res) => {
            if (res.status === 200) {
              this.updateStatusBar(res.data);
              this.updateActivityBar(res.data);
            }
          })
          .catch((error) => {
              console.error(error);
          });
    }
    formatCoinData(data) {
        let coinArr = {
            'USDT': [],
            'ETH' : [],
            'BTC' : []
        }
        data = data.sort(util.sortObj("last"));
        data.forEach((item) => {
            const { instrument_id } = item;
            const coinInfo = util.getCoinInfo(instrument_id);
            const trading = coinInfo[1];
            const link = `${OKEX_LINK}${coinInfo.join('-').toLowerCase()}`;
            const isFocus = this.coins.indexOf(instrument_id) === -1 ? 0 : 1;

            if(trading === 'ETH' || trading === 'USDT' || trading === 'BTC'){
                const newItem = {
                    label: `「${coinInfo[0]}」${item.last} ${item.last > item.open_24h ? '📈' : '📉'} ${((item.last - item.open_24h) / item.open_24h * 100).toFixed(2)}%`,
                    icon: `star${isFocus}.png`,
                    symbol: instrument_id,
                    link: link,
                    extension: "coin.focus"
                }
                coinArr[trading].push(newItem);
            }
        });
        return coinArr;
    }
    updateActivityBar(data) {
        const coinData = this.formatCoinData(data);
        let provider = new TreeProvider(vscode.workspace.rootPath, coinData['USDT'], this.activateContext);
        vscode.window.registerTreeDataProvider("USDT", provider);
    }
    updateStatusBar(data) {
        data.forEach((item) => {
            const { instrument_id } = item;
            const coinInfo = util.getCoinInfo(instrument_id);
            if (this.coins.indexOf(instrument_id) !== -1) {
                const statusBarItemsText = `「${coinInfo[0]}」${item.last} ${coinInfo[1]} ${item.last > item.open_24h ? '📈' : '📉'} ${((item.last - item.open_24h) / item.open_24h * 100).toFixed(2)}%`;
                if (this.statusBarItems[instrument_id]) {
                    this.statusBarItems[instrument_id].text = statusBarItemsText;
                } else {
                    this.statusBarItems[instrument_id] = this.createStatusBarItem(statusBarItemsText);
                }
            }
        });
    }
    createStatusBarItem(text = '') {
        const barItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        barItem.text = text;
        barItem.show();
        return barItem;
    }
    init() {
        this.coins = util.getConfigurationCoinList();
        this.updateInterval = util.getConfigurationTime()
        this.fetchAllData();
        this.timer = setInterval(() => {
            this.fetchAllData();
        }, this.updateInterval);
    }
}
module.exports = App;