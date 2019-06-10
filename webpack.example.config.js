const path = require('path');
module.exports = {
    entry: './example/index.ts',
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    output: {
      filename: 'example-bundle.js',
      path: path.resolve(__dirname, 'example-dist')
    }
};