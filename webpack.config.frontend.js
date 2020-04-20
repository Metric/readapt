'use strict';

const path = require('path');

module.exports = exports = {
	mode: 'development',
    entry: path.resolve(__dirname, 'src/client.js'),
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'readapt.dev.min.js'
    },
    module: {
        rules: [
            {
               loader: 'ts-loader',
               exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.jsx', '.tsx']
    }
};