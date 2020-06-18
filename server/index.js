const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const config = require("./config");
const router = require("./router");
const PORT = process.env.PORT || config.server_port;

const crud = require("./crud");
const {
  userConnect,
  userDisconnect,
  userLeaveRoom,
  userJoinRoom,
  userCreateNewRoom,
  userTransportMsg,
} = crud;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

io.on("connection", (socket) => {
  // console.log(socket);
  socket.on("begin", ({ userID }, callback) => {
    console.log(`${userID} has connected`);
    const { error, usersRooms } = userConnect({ userID: userID });
    if (error) {
      callback({ error: error });
    } else {
      callback({ usersRooms: usersRooms });
    }
  });

  socket.on("end", ({ userID }, callback) => {
    const { error } = userDisconnect({ userID: userID });
    if (error) {
      console.log(error);
    }
    console.log(`${userID} has left.`);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
