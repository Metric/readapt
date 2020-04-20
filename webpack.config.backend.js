'use strict';

const path = require('path');

module.exports = exports = {
	mode: 'production',
    entry: path.resolve(__dirname, 'src/server.js'),
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'readapt.server.min.js'
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