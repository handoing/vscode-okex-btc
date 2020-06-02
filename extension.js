const App = require('./src/app');

exports.activate = function(context) {
    require('./src/regCommand')(context);
    new App(context);
};

exports.deactivate = function() {
    console.log('您的扩展已被释放！')
};