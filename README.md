# webpack-dev-server-sio

> webpack dev server with reload and ie8 compability

This tool is for solving problems when using below packages:

- webpack-dev-server
- webpack-hot-middleware

which would use some uncompatible features of es6 like `setter/getter`, that won't work under ie8.

## Requirement

- webpack 4.x
- node >= 8.9

## Notice

- Webpack config is basically the same as webpack 4
- The compiled result should be compatible with ie8. This tool is just for **hot reload**.

## Usage

### install

```bash
npm install --save-dev webpack-dev-server-sio
# or
yarn add --dev webpack-dev-server-sio
```

### script

in package.json

```json
{
    "script": {
        "dev:sio": "webpack-dev-server-sio --config=config/webpack.conf.js"
    }
}
```

in config

```js
// config/webpack.config.js
// 除了 devServe 之外的配置与正常 webpack4 配置没有区别

module.exports = {
    ...
    devServer: {
        // port for the server in localhost，http://localhost:port
        port: 9090,
        // the path of packaged resource
        contentBase: 'C://path/to/pack/resource',
        // pxoxy config is the same as webpack-dev-server
        proxy: {
            '/re': {
                target: 'http://localhost:7001',
                changeOrigin: true,
                pathRewrite: {
                    '^/re': '/re',
                },
            },
        },
        // see connect-history-api-fallback
        historyApiFallback: {
            rewrites: [
                {
                    from: /\/home/, to: '/home.html/',
                },
            ],
        },
        // set headers of server responses
        headers: [
            'set-cookie': 'token=token; path=/',
        ],
    }
}
```

