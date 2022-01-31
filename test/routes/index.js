/* eslint-disable flowtype/require-variable-type */
/* eslint-disable flowtype/require-parameter-type */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

var express = require('express');
const { confluenceDynamicMacro, confluenceDynamicMacroFunction } = require('../../functions/lib');

module.exports = function (app, addon) {

  app.get('/', function (req, res) {
    console.log('GET /');
    res.format({
      'text/html': function () {
        res.redirect('/atlassian-connect.json')
      },
      'application/json': function () {
        res.redirect('/atlassian-connect.json')
      },
    })
  })

  app.get('/confluence/dynamic-macro', addon.authenticate(), function (req, res) {
    console.log('GET /confluence/dynamic-macro');
    // confluenceDynamicMacro(req, res);
    confluenceDynamicMacroFunction(req, res, addon);
  })

  app.get('/confluence/editor', function (req, res) {
    console.log('GET /confluence/editor');
    const path = 'index.html';
    console.log('GET /confluence/editor -> ' + path);
    res.sendFile(path, {root: __dirname + '../../../dist'});
  })

  app.get('/confluence/editor/*', function (req, res) {
    console.log('GET /confluence/editor/*');
    const path = req.params[0] ? req.params[0] : 'index.html';
    console.log('GET /confluence/editor/* -> ' + path);
    res.sendFile(path, {root: __dirname + '../../../dist'});
  })

  // Finally serve up static assets
  var path = require('path');
  var staticDir = path.join(__dirname, '../../dist');
  app.use(express.static(staticDir));

}
