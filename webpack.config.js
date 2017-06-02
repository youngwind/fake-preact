const path = require('path');
module.exports = {
    entry: {
        'examples/basic/bundle': './examples/basic/index.js',
        'examples/component/bundle': './examples/component/index.js'
    },
    output: {
        path: path.resolve(__dirname),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader'
            }
        }]
    }
};