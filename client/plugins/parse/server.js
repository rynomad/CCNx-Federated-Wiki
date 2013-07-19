(function() {
  var WebSocketServer, fs, readTally, startServer;

  WebSocketServer = require('ws').Server;

  fs = require('fs');

  readTally = function(path, done) {
    return fs.readFile(path, 'utf8', function(err, data) {
      var line, p, q, tally, _i, _len, _ref;
      if (err) {
        return console.log(err);
      }
      tally = {};
      _ref = data.split(/\n/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (p = line.match(/"(.+?)" -> "(.+?)"/)) {
          if (q = line.match(/label = "(\d+)"/)) {
            tally["" + p[1] + "->" + p[2]] = +q[1];
          }
        }
      }
      return done(tally);
    });
  };

  startServer = function(params) {
    var k, socket, v;
    console.log('parse startServer', (function() {
      var _results;
      _results = [];
      for (k in params) {
        v = params[k];
        _results.push(k);
      }
      return _results;
    })());
    socket = new WebSocketServer({
      server: params.server,
      path: '/plugin/parse'
    });
    return socket.on('connection', function(ws) {
      return (function(count) {
        var tick;
        ws.on('message', function(message) {
          return console.log('parse client says:', message);
        });
        tick = function() {
          var path;
          path = "" + params.argv.c + "/plugins/parse/runs/1234/tally.dot";
          return readTally(path, function(tally) {
            var message;
            message = JSON.stringify({
              action: 'tick',
              count: count++,
              tally: tally
            }, null, 2);
            console.log(message);
            return ws.send(message, function(err) {
              if (err) {
                return console.log('unable to send ws message:', err);
              } else if (count <= 4 * 60) {
                return setTimeout(tick, 1000);
              } else {
                return ws.close();
              }
            });
          });
        };
        console.log('start ticking');
        return tick();
      })(10);
    });
  };

  module.exports = {
    startServer: startServer
  };

}).call(this);
