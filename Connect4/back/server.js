const http = require('http');
const url = require('url');
const { Game } = require('./game.js');

const hostname = '127.0.0.1';
const port = 3001;

let game = new Game();

const server = http.createServer();

server.on('request', (request, response) => {
  let urlInfo = url.parse(request.url, true);
  response.writeHead(200, { 'Content-Type': 'application/json' });

  const data = handleRequest(urlInfo);
  response.end(JSON.stringify(data));
});

server.listen(port, hostname, () =>
  console.log(`Connect4 API running at http://${hostname}:${port}/`)
);

function handleRequest(urlInfo) {
  const path = urlInfo.pathname;
  const query = urlInfo.query;

  if (path === '/startgame') {
    game = new Game();
  } 
  else if (path === '/gameboard') {
    return { board: game.board };
  } 
  else if (path === '/state') {
    return {
      turn: game.turn,
      active: game.active,
      winner: game.winner
    };
  } 
  else if (path === '/droptoken') {
    const column = Number(query.column);
    if (!isNaN(column)) {
      game.dropToken(column);
    }
  }

  return game;
}
