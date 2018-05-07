#!/usr/bin/env node
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const argv = require('yargs').argv;
const path = require('path');
const proxy = require('http-proxy-middleware');

if (argv.host && argv.port && argv.provider) {
  
  const providerPath = `${__dirname}/${argv.provider}`;
  const providerDir = path.dirname(providerPath);
  const providerCache = `${providerDir}/cache.html`;
  const provider = require(providerPath);
  if (provider && provider.parse && typeof provider.parse === 'function' && !isNaN(argv.port)) {

    if (provider.proxyUrls && provider.proxyUrls.forEach) {
      
      provider.proxyUrls.forEach(proxyUrl => {
        console.log(`${argv.host}${proxyUrl}`);
        app.use(proxyUrl, proxy({target: argv.host, changeOrigin: true}));
      });
    }
    
    app.use('/', express.static(path.join(__dirname, '../dist-prod/')));
    
    console.log(`\nServer listening on port ${argv.port}`);
    app.listen(argv.port);
  } else {
    console.log('invalid provider');
  }
} else {
  console.log('invalid params');
}






