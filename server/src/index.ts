import * as dotenv from "dotenv";
dotenv.config();
const db_connection_string = process.env.DATABASE;
const PORT: string | number = process.env.PORT || 4000;
let error;
import express from "express";
import socketio from "socket.io";
import http from "http";
import router from "./router";
import { getGameCmd } from "./game";
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
  getRoomPlayers,
  getRoomGame,
  saveSystemMessage,
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

  // "@fbchess"
  socket.on("outbound_message", (roomID: string, message: msgType) => {
    console.log("Message received: ");
    console.log(message);
    saveMsg(message.from, roomID, message.msg);
    io.in(roomID).emit("message", roomID, message);
    // console.log(message.msg.substring(0, 10));
    if (message.msg.length > 9 && message.msg.substring(0, 9) === "@fbchess ") {
      console.log("MOVE TRIGGERED: " + message.msg);
      const roomPlayers = getRoomPlayers(roomID);
      const pW = roomPlayers.playerWhite ? roomPlayers.playerWhite : "";
      const pB = roomPlayers.playerBlack ? roomPlayers.playerBlack : "";
      console.log("MOVE: |" + message.msg.substring(9));
      const systemMsg = getGameCmd(
        getRoomGame(roomID),
        message.from,
        pW,
        pB,
        message.msg.substring(9)
      );
      console.log(systemMsg);
      saveSystemMessage(roomID, systemMsg);
      io.to(roomID).emit("message", roomID, systemMsg);
    }
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
        if (result.updatedRoom.playerBlack in userSocket) {
          io.to(userSocket[result.updatedRoom.playerBlack]).emit(
            "incoming_room",
            getUsersRooms(result.updatedRoom.playerBlack)
          );
        }

        if (result.updatedRoom.playerWhite in userSocket) {
          io.to(userSocket[result.updatedRoom.playerWhite]).emit(
            "incoming_room",
            getUsersRooms(result.updatedRoom.playerWhite)
          );
        }
      }
    }
  );

  socket.on(
    "leave_room",
    (
      userID: string,
      roomID: string,
      callback: ({ error }: { error: string }) => void
    ) => {
      let { playerBlack, playerWhite, error } = getRoomPlayers(roomID);
      if (error) {
        callback({ error: error });
        return;
      }

      let result = userLeaveRoom(userID, roomID);
      if (result?.error) {
        callback({ error: result.error });
        return;
      }
      if (playerBlack && playerBlack in userSocket) {
        io.to(userSocket[playerBlack]).emit(
          "incoming_room",
          getUsersRooms(playerBlack)
        );
      }
      if (playerWhite && playerWhite in userSocket) {
        io.to(userSocket[playerWhite]).emit(
          "incoming_room",
          getUsersRooms(playerWhite)
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
