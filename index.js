'use strict';
// 检测 node 版本，http2 node 最低支持版本为 v8.4.0，https
require('webpack-launcher-utils/checkNodeVersion')('v10.0.0');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// 脚本未知原因终止运行，需要提示错误
process.on('unhandledRejection', err => {
  throw err;
});

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const http2 = require('http2');
const handler = require('serve-handler');
const del = require('del');
const createCertificate = require('webpack-dev-server/lib/utils/createCertificate');
const createSigntSigtermProcessEvent = require('webpack-launcher-utils/createSigntSigtermProcessEvent');
const openBrowser = require('react-dev-utils/openBrowser');
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');

/**
 * 创建 http 或者 https server（直接使用 webpack-dev-server 代码）
 * @param {Object} app koa app 实例
 * @param {Object} options
 * @param {Boolean} options.https 是否使用 https
 */
function createServer(app, options = {}) {
  let server;
  let httpsConfig = {};
  let fakeCert;

  if (options.https || options.http2) {
    if (!httpsConfig.key || !httpsConfig.cert) {
      // Use a self-signed certificate if no certificate was configured.
      // Cycle certs every 24 hours
      const certPath = path.join(__dirname, './ssl/server.pem');

      let certExists = fs.existsSync(certPath);

      if (certExists) {
        const certTtl = 1000 * 60 * 60 * 24;
        const certStat = fs.statSync(certPath);

        const now = new Date();

        // cert is more than 30 days old, kill it with fire
        if ((now - certStat.ctime) / certTtl > 30) {
          del.sync([certPath], { force: true });

          certExists = false;
        }
      }

      if (!certExists) {
        const attrs = [{ name: 'commonName', value: 'localhost' }];

        const pems = createCertificate(attrs);

        fs.writeFileSync(certPath, pems.private + pems.cert, { encoding: 'utf-8' });
      }

      fakeCert = fs.readFileSync(certPath);

      httpsConfig.key = httpsConfig.key || fakeCert;
      httpsConfig.cert = httpsConfig.cert || fakeCert;
    }
  }

  if (options.https) {
    server = https.createServer(httpsConfig, app);
  } else if (options.http2) {
    server = http2.createSecureServer(httpsConfig, app);
  } else {
    server = http.createServer(app);
  }
  return server;
}

function runServer(options) {
  let { host = 'localhost', port, https: isHttps, http2: isHttp2 } = options;
  const server = createServer(handler, { https: isHttps, http2: isHttp2 });

  server.listen(port, function() {
    const protocol = isHttps || isHttp2 ? 'https' : 'http';
    const localUrlForTerminal = `${protocol}://${host}:${port}`;
    openBrowser(localUrlForTerminal);
    console.log(`Now you can view the static resource in the browser.`);
    console.log();
    console.log(`  ${localUrlForTerminal}`);
  });
  createSigntSigtermProcessEvent(function() {
    // ctr + c 退出等
    server.close();
    process.exit();
  });
}

module.exports = function(options) {
  // 默认端口 5000
  options = { port: 62333, ...options };
  // 只处理 localhost 上的端口
  choosePort('localhost', options.port)
    .then(port => {
      runServer({ ...options, port });
    })
    .catch(err => {
      if (err && err.message) {
        console.log(err.message);
      }
      process.exit(1);
    });
};
