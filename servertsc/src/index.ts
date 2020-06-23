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
  getUsersRooms,
} from "./crud";

interface userSocketMapType {
  [userID: string]: string;
}

const userSocket: userSocketMapType = {};
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
    userSocket[email] = socket.id;
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
    delete userSocket[email];
    socket.leaveAll();
    userDisconnect(email);
    callback();
  });

  socket.on(
    "join_room",
    (
      userID: string,
      roomID: string,
      callback: ({ error }: { error: string }) => void
    ) => {
      let result = userJoinRoom(userID, roomID);
      let error = result?.error;
      let userError = result?.userError;

      if (error) {
        callback({ error: error });
        return;
      }

      if (userError) {
        callback({ error: userError });
        return;
      }

      socket.join(roomID);
      if (result.updatedRoom) {
        io.to(userSocket[result.updatedRoom.playerBlack]).emit(
          "incoming_room",
          getUsersRooms(result.updatedRoom.playerBlack)
        );

        io.to(userSocket[result.updatedRoom.playerWhite]).emit(
          "incoming_room",
          getUsersRooms(result.updatedRoom.playerWhite)
        );
      }
    }
  );
  socket.on(
    "new_room",
    (userID: string, callback: ({ error }: { error: string }) => void) => {
      let result = userCreateNewRoom(userID);
      let error = result.error;
      let userError = result.userError;
      if (error) {
        callback({ error: error });
        return;
      } else if (userError) {
        callback({ error: userError });
        return;
      }
      if (result.newID) {
        socket.join(result.newID);
        console.log(getUsersRooms(userID));
        io.to(userSocket[userID]).emit("incoming_room", getUsersRooms(userID));
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("A use left.");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
