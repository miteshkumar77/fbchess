const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const config = require("./config");
const router = require("./router");
const PORT = process.env.PORT || config.server_port;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

io.on("connection", (socket) => {
  console.log("A user connected.");
  socket.on("disconnect", () => {
    console.log("A user has left.");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
