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
    else if (urlInfo.pathname == '/addRoll1') {
        console.log("Query params:", urlInfo.query);
        let rollValue = Number(urlInfo.query['roll']);
        if (!isNaN(rollValue)) {
            game.addRoll1(rollValue);
        }
    }
    else if (urlInfo.pathname == '/addRoll2') {
        let rollValue = Number(urlInfo.query['roll']);
        if (!isNaN(rollValue)) {
            game.addRoll2(rollValue);
        }
    }
    return game;
}

class Game {
    constructor() {
        this.rollCount1 = 0;
        this.rollCount2 = 0;
        this.rollTotal1 = 0;
        this.rollTotal2 = 0;
        this.lastRoll1 = null;
        this.lastRoll2 = null;
        this.target = 25;
        this.gameStatus = 'new';
        this.winner = '';
    }

    addRoll1 = (rollValue) => {
        console.log("Adding roll1:", rollValue);
        if (this.gameStatus == 'complete') {
            return;
        }
        this.rollCount1++;
        this.rollTotal1 += rollValue;
        this.lastRoll1 = rollValue;
        if (this.rollTotal1 >= this.target) {
            this.gameStatus = 'complete';
            this.winner = 'Player One Wins!';
        } else {
            this.gameStatus = 'in progress';
        }
    }

    addRoll2 = (rollValue) => {
        if (this.gameStatus == 'complete') {
            return;
        }
        this.rollCount2++;
        this.rollTotal2 += rollValue;
        this.lastRoll2 = rollValue;
        if (this.rollTotal2 >= this.target) {
            this.gameStatus = 'complete';
            this.winner = 'Player Two Wins!';
        } else {
            this.gameStatus = 'in progress';
        }
    }
}

var game = game || new Game();