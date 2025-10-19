const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3007;

const server = http.createServer();

server.on('request', (request, response) => {
    let urlInfo = url.parse(request.url, true);
    console.log(urlInfo);
    response.writeHead(200, {'Content-type': 'application/json'});
    response.end(JSON.stringify(handleRequest(urlInfo)));
})

server.listen(port, hostname, () => console.log('Server running on port ' + port))

function handleRequest(urlInfo) {
    if (urlInfo.pathname == '/start') {
        game = new Game();
    }
    else if (urlInfo.pathname == '/addRoll') {
        let rollValue = Number(urlInfo.query.roll);
        if (!isNaN(rollValue)) {
            game.addRoll(rollValue);
        }
        console.log("here");
    }
    console.log(game);
    return game;
}

class Game {
    constructor() {
        this.rollCount = 0;
        this.rollTotal = 0;
        this.target = 25;
        this.gameStatus = 'new';
    }

    addRoll = (rollValue) => {
        if (this.gameStatus == 'complete') {
            return;
        }
        this.rollCount++;
        this.rollTotal += rollValue;
        if (this.rollTotal >= this.target) {
            this.gameStatus = 'complete';
            console.log(this)
        } else {
            this.gameStatus = 'in progress';
        }
    }
}

var game = game || new Game();
