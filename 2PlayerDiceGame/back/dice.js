const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3006;

const server = http.createServer();

server.on('request', (request, response) => {
    if (request.url === '/' || request.url === '/dice') {
        let urlInfo = url.parse(request.url, true);
        console.log(urlInfo);
        response.writeHead(200, {'Content-type': 'application/json'});
        response.end(JSON.stringify(diceRoll()));
    } else {
        response.writeHead(404);
        response.end();
    }
})

server.listen(port, hostname, () => console.log('Server running on port ' + port))

function diceRoll() {
    return Math.floor(Math.random() * 6 + 1);
}