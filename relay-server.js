var http = require('http');
var rooms = {};

http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  var u = new URL(req.url, 'http://x');
  var room = u.searchParams.get('room');
  if (!room || room.length > 8) { res.writeHead(400); res.end(); return; }
  rooms[room] = rooms[room] || [];

  if (req.method === 'POST') {
    var body = '';
    req.on('data', function(c) { body += c; });
    req.on('end', function() {
      rooms[room].push(body);
      if (rooms[room].length > 500) rooms[room] = rooms[room].slice(-500);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end('{"ok":1}');
    });
  } else {
    var since = parseInt(u.searchParams.get('since')) || 0;
    var msgs = rooms[room].slice(since);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({m: msgs, n: rooms[room].length}));
  }
}).listen(process.env.PORT || 3000, function() {
  console.log('Game relay running on port ' + (process.env.PORT || 3000));
});
