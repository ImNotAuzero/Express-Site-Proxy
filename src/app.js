const 
  app = require('express')(), 
  proxy = require('express-http-proxy'), 
  fs = require('fs-extra'), 
  proxyList = require('./proxyList.json');

app.all('*', (req, res, next) => {
  console.log(`${req.path} Requested.`);
  return next();
})

proxyList.forEach((entry) => {
  let options = Object.assign(
    {
      // Error handling.
      proxyErrorHandler: function(err, res, next) {
        switch (err && err.code) {
          case 'ECONNREFUSED': { return res.status(200).send('Connection refused for request. Try again later...'); }
          case 'ECONNRESET': { return res.status(405).send('Method not allowed. But is supported by the server.'); }
          default: { next(err); }
        }
      }
    },
    // Options for each url. Allows use for encoding body requests. - Allows to preserve buffers when being proxied request is a body - i.e image uploaders. ref: proxy docs.
    entry.options
    )
  app.use(entry.url, proxy(entry.forwardTo, options) );
});

app.listen(1, () => { console.log('App is running on port 1'); });
