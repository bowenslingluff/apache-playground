const http = require("http");

const hostname = "127.0.0.1";
const port = 3000;
const server = http.createServer();
server.on("request", (request, response) => {
    response.writeHead(200, {
        "Content-type": "text/html"
    });
    response.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Node Server</title>
    </head>
    <body>
      <h1>Hello from port 3000</h1>
      <button onclick="window.location.href='http://localhost:8080/'">
        Go back to Apache (port 8080)
      </button>
    </body>
    </html>
  `);
});

server.listen(port, hostname, () => console.log("server running..."));