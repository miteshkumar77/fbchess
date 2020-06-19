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
    }

    let response = getMessageHist(email);
    console.log(response.roomsList);
    callback({ hist: response.roomsList });
  });

  socket.on("deinitialize", (email: string, callback) => {
    console.log(`Disconnecting user ${email}.`);
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
