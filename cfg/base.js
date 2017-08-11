'use strict';
const path = require('path');
const sourcePath = path.join(__dirname, '../src');

module.exports = {
    context: sourcePath,
    devtool: 'eval',
    entry: {
        "app": [
            '../cloudinary.coffee.js'
        ]
    },
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "cloudinary.js",
        publicPath: './'
    },
    resolve: {
        extensions: [".js", ".coffee"]
    },
    module: {
        rules: [            
            {
                test: /\.coffee$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'coffee-loader',
                        options: {
                            cacheDirectory: true
                        }
                    }
                ]
            },
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: [
                    {   
                        options:  { cacheDirectory: true },  
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                test: /\.json$/,
                exclude: /node_modules/,
                use: [
                    {   
                        options:  { cacheDirectory: true },  
                        loader: 'json-loader'
                    }
                ]
            }
        ]
    },
    target: 'node',
    node: {
        console: true,
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};