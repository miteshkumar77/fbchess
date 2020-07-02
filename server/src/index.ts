// Imports
import * as dotenv from "dotenv";
import express from "express";
import socketio from "socket.io";
import http from "http";
import router from "./router";
import { getGameCmd } from "./game";
import path from "path";
dotenv.config();

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
  userConnect_R,
  userCreateNewRoom_R,
  userDisconnect_R,
  userLeaveRoom_R,
} from "./crud";

import { mongoBegin } from "./models";

const PORT: string | number = process.env.PORT || 4000;
let error;

interface userSocketMapType {
  [userID: string]: string;
}

const userSocket: userSocketMapType = {};
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

if (process.env.ENV === "PRODUCTION") {
  console.log("Displaying front-end static files...");
  app.use("/", express.static(path.join(__dirname, "../../client/build")));
}
io.on("connection", (socket) => {
  // socket.on("initialize", (email: string, callback) => {
  //   console.log(`Connecting user ${email}.`);
  //   error = userConnect(email)?.error;
  //   if (error) {
  //     callback({ error: error });
  //     return;
  //   }

  //   let response = getMessageHist(email);
  //   userSocket[email] = socket.id;

  //   if (response.roomsList) {
  //     socket.join(Object.keys(response.roomsList));
  //   }
  //   callback({ hist: response.roomsList });
  // });

  socket.on("initialize", (email: string, callback) => {
    console.log(`Connecting user ${email}.`);
    userConnect_R(email, () => {
      let response = getMessageHist(email);
      console.log(response);
      userSocket[email] = socket.id;

      if (response.roomsList) {
        socket.join(Object.keys(response.roomsList));
      }
      callback({ hist: response.roomsList });
    });
  });

  socket.on("outbound_message", (roomID: string, message: msgType) => {
    saveMsg(message.from, roomID, message.msg);
    io.in(roomID).emit("message", roomID, message);
    if (message.msg.length > 9 && message.msg.substring(0, 9) === "@fbchess ") {
      const roomPlayers = getRoomPlayers(roomID);
      console.log(roomPlayers);
      const pW = roomPlayers.playerWhite ? roomPlayers.playerWhite : "";
      const pB = roomPlayers.playerBlack ? roomPlayers.playerBlack : "";
      const systemMsg = getGameCmd(
        getRoomGame(roomID),
        message.from,
        pB,
        pW,
        message.msg.substring(9)
      );
      saveSystemMessage(roomID, systemMsg);
      io.to(roomID).emit("message", roomID, systemMsg);
    }
  });

  // socket.on("deinitialize", (email: string, callback) => {
  //   delete userSocket[email];
  //   socket.leaveAll();
  //   userDisconnect(email);
  //   callback();
  // });

  socket.on("deinitialize", (email: string, callback) => {
    console.log(`Disconnecting ${email}.`);
    delete userSocket[email];
    socket.leaveAll();
    userDisconnect_R(email);
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

  // socket.on(
  //   "leave_room",
  //   (
  //     userID: string,
  //     roomID: string,
  //     callback: ({ error }: { error: string }) => void
  //   ) => {
  //     let { playerBlack, playerWhite, error } = getRoomPlayers(roomID);
  //     if (error) {
  //       callback({ error: error });
  //       return;
  //     }

  //     let result = userLeaveRoom(userID, roomID);
  //     if (result?.error) {
  //       callback({ error: result.error });
  //       return;
  //     }
  //     if (playerBlack && playerBlack in userSocket) {
  //       io.to(userSocket[playerBlack]).emit(
  //         "incoming_room",
  //         getUsersRooms(playerBlack)
  //       );
  //     }
  //     if (playerWhite && playerWhite in userSocket) {
  //       io.to(userSocket[playerWhite]).emit(
  //         "incoming_room",
  //         getUsersRooms(playerWhite)
  //       );
  //     }
  //   }
  // );

  socket.on(
    "leave_room",
    async (
      userID: string,
      roomID: string,
      callback: ({ error }: { error: string }) => void
    ) => {
      let { playerBlack, playerWhite, error } = getRoomPlayers(roomID);
      if (error) {
        callback({ error: error });
        return;
      }

      await userLeaveRoom_R(userID, roomID);

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
  // socket.on(
  //   "new_room",
  //   (userID: string, callback: ({ error }: { error: string }) => void) => {
  //     let result = userCreateNewRoom(userID);
  //     let error = result.error;
  //     let userError = result.userError;
  //     if (error) {
  //       callback({ error: error });
  //       return;
  //     } else if (userError) {
  //       callback({ error: userError });
  //       return;
  //     }
  //     if (result.newID) {
  //       socket.join(result.newID);
  //       io.to(userSocket[userID]).emit("incoming_room", getUsersRooms(userID));
  //     }
  //   }
  // );

  socket.on(
    "new_room",
    async (
      userID: string,
      callback: ({ error }: { error: string }) => void
    ) => {
      let newRoom = await userCreateNewRoom_R(userID);
      console.log(getUsersRooms(userID));
      if (newRoom) {
        socket.join(newRoom.newRoomID);
        io.to(userSocket[userID]).emit("incoming_room", getUsersRooms(userID));
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("A use left.");
  });
});

mongoBegin(() => {
  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
