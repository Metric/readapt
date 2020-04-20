'use strict';

const path = require('path');

module.exports = exports = {
	mode: 'production',
    entry: path.resolve(__dirname, 'src/client.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'readapt.min.js'
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