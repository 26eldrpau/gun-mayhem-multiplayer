const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './client/src/main.js',
    devtool: 'eval-cheap-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Epicka gra pogczamp',
            template: 'assets/index.html',
        }),
    ],
    resolve: {
        alias: {
            common: path.resolve(__dirname, 'common/'),
        }
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};
