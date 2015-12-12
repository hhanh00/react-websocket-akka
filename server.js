import express from 'express';
import webpack from 'webpack';
import config from './webpack.config';
import http from 'http';
import httpProxy from 'http-proxy';
import path from 'path';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const app = express();
const compiler = webpack(config);

const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:4101',
  ws: true
});

const proxyError = (error, req, res) => {
  let json;
  if (error.code !== 'ECONNRESET') {
    console.error('proxy error', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, {'content-type': 'application/json'});
  }

  json = {error: 'proxy_error', reason: error.message};
  res.end(JSON.stringify(json));
}

proxy.on('error', proxyError);

app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

app.use('/data', (req, res) => {
  proxy.web(req, res);
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, '0.0.0.0', error => {
  if (error) {
    console.log(error);
    return;
  }

  console.log('Listening at http://localhost:3000');
});
