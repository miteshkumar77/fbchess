import * as dotenv from "dotenv";
dotenv.config();
const db_connection_string = process.env.DATABASE;
const PORT: string | number = process.env.PORT || 4000;
let error;
import express from "express";
import socketio from "socket.io";
import http from "http";
import router from "./router";

import {
  saveMsg,
  userConnect,
  userCreateNewRoom,
  userDisconnect,
  userJoinRoom,
  userLeaveRoom,
  getMessageHist,
  msgType,
} from "./crud";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

io.on("connection", (socket) => {
  // console.log("A user connected.");

  socket.on("initialize", (email: string, callback) => {
    console.log(`Connecting user ${email}.`);
    error = userConnect(email)?.error;
    if (error) {
      callback({ error: error });
      return;
    }

    let response = getMessageHist(email);
    console.log(response.roomsList);

    if (response.roomsList) {
      socket.join(Object.keys(response.roomsList));
      console.log(Object.keys(response.roomsList));
    }
    callback({ hist: response.roomsList });
  });

  socket.on("outbound_message", (roomID: string, message: msgType) => {
    console.log("Message received: ");
    console.log(message);
    saveMsg(message.from, roomID, message.msg);
    io.in(roomID).emit("message", roomID, message);
  });
  socket.on("deinitialize", (email: string, callback) => {
    console.log(`Disconnecting user ${email}.`);
    socket.leaveAll();
    userDisconnect(email);
    callback();
  });

  socket.on("disconnect", () => {
    console.log("A use left.");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
