#!/usr/bin/env node
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const argv = require('yargs').argv;
const path = require('path');
const cheerio = require('cheerio');
const process = require('process');
const proxy = require('http-proxy-middleware');

if (argv.provider && argv.host && argv.url && argv.webpackConfig && argv.port) {
  const webpackConfig = require(`${process.cwd()}/${argv.webpackConfig}`);
  const compiler = webpack(webpackConfig);
  const providerPath = `${__dirname}/${argv.provider}`;
  const providerDir = path.dirname(providerPath);
  const providerCache = `${providerDir}/cache.html`;
  const provider = require(providerPath);
  if (provider && provider.parse && typeof provider.parse === 'function' && !isNaN(argv.port)) {
    app.use(middleware(compiler, {
      logLevel: 'debug',
      index: false,
      hot: true
    }));
    
    app.use(require("webpack-hot-middleware")(compiler));

    if (provider.proxyUrls && provider.proxyUrls.forEach) {
      
      provider.proxyUrls.forEach(proxyUrl => {
        console.log(`${argv.host}${proxyUrl}`);
        app.use(proxyUrl, proxy({target: argv.host, changeOrigin: true}));
      });
    }
    
    app.use('/', function (req, res, next) {

      if (fs.existsSync(providerCache) && req.query.c !== '1') {
        const cacheHtml = fs.readFileSync(providerCache, 'utf8');
        const cacheIndicatorHtml = fs.readFileSync(`${__dirname}/templates/from-cache.html`, 'utf8');

        const $ = cheerio.load(cacheHtml);
        $('body').prepend(cacheIndicatorHtml);

        res.send($.html());
      } else {
        http.get(`${argv.host}/${argv.url}`, (httpRes) => {
          const { statusCode } = httpRes;
          if (statusCode !== 200) {
            next();
          } else {
            httpRes.setEncoding('utf8');
            let rawData = '';
            httpRes.on('data', (chunk) => { rawData += chunk; });
            httpRes.on('end', () => {
              const html = provider.parse(rawData, argv.host, req.query.lat, req.query.lng);
              fs.writeFileSync(providerCache, html, { encoding: 'utf8' });

              const cacheIndicatorHtml = fs.readFileSync(`${__dirname}/templates/from-server.html`, 'utf8');

              const $ = cheerio.load(html);
              $('body').prepend(cacheIndicatorHtml);

              res.send($.html());
            });
          }
        });
      }
    });
    
    console.log(`\nServer listening on port ${argv.port}`);
    app.listen(argv.port);
  } else {
    console.log('invalid provider');
  }
} else {
  console.log('invalid params');
}






