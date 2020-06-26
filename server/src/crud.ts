import { nanoid } from "nanoid";
import { Chess, ChessInstance } from "chess.js";
import { board_default } from "./board_formulas";
import {
  Message,
  messageModel,
  roomModel,
  userModel,
  Room,
  User,
} from "./models";

const newGameFEN: string =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
interface userStoreType {
  [userID: string]: {
    rooms: Array<string>;
  };
}

export interface msgType {
  from: string;
  to: string;
  type: string;
  msg: string;
}

interface cachedRoomType {
  playerBlack: string;
  playerWhite: string;
  currentGameState: ChessInstance;
  history: Array<msgType>;
}

interface roomCacheType {
  [roomID: string]: cachedRoomType;
}

interface databaseRoomType {
  playerBlack: string;
  playerWhite: string;
  currentGameStateFEN: string;
  history: Array<msgType>;
}

interface databaseType {
  [roomID: string]: databaseRoomType;
}

const roomsDB: databaseType = {};
const usersDB: userStoreType = {};

let loadedRooms: roomCacheType = {};
let loadedUsers: userStoreType = {};

export const userConnect = (userID: string) => {
  let error;
  if (!(userID in usersDB)) {
    //console.log(`Adding user ${userID} to DB`);
    error = createUserInDB(userID)?.error;
    if (error) {
      return { error: error };
    }
  }

  error = loadUser(userID)?.error;
  if (error) {
    return { error: error };
  }
  error = loadUsersRooms(userID)?.error;
  if (error) {
    return { error: error };
  }
};

// export const userConnect_R = async (userID: string) => {
//   let user = await userModel.findByIdAndUpdate(
//     userID,
//     { upsert: true },
//     (err, doc) => {
//       if (err) {
//         console.error(err);
//       }
//       if (doc) {
//         loadedUsers[userID] = {
//           rooms: doc.rooms,
//         };
//       }
//     }
//   );
//   if (!user) {
//     return;
//   }
//   return Promise.all(
//     user.rooms.map((roomID) => {
//       if (!(roomID in loadedRooms)) {
//         return roomModel.findById(roomID, (err, doc) => {
//           if (doc) {
//             loadedRooms[roomID] = {
//               currentGameState: getRoomGame(doc.currentGameStateFEN),
//               history: doc.history,
//               playerBlack: doc.playerBlack,
//               playerWhite: doc.playerWhite,
//             };
//           }
//         });
//       }
//     })
//   );
// };

export const userConnect_R = async (userID: string) => {
  if (userID in loadedRooms) {
    return;
  }
  let user = await userModel.findOne({ userID: userID });
  if (!user) {
    user = await userModel.create({ userID: userID, rooms: Array<string>() });
  }
  if (user) {
    loadedUsers[userID] = {
      rooms: user.rooms.map((roomID) => roomID[0]),
    };
    await Promise.all(
      user.rooms.map((roomID) => {
        if (!(roomID in loadedRooms)) {
          return roomModel.findOne({ roomID: roomID }, (err, doc) => {
            if (doc) {
              loadedRooms[roomID] = {
                currentGameState: getRoomGame(doc.currentGameStateFEN),
                history: doc.history,
                playerBlack: doc.playerBlack,
                playerWhite: doc.playerWhite,
              };
            }
          });
        }
      })
    );
  }
};

export const getMessageHist = (userID: string) => {
  // if (!(userID in usersDB)) {
  //   return { error: `user ${userID} does not exist.` };
  // }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  //console.log("User Loaded: ");
  //console.log(loadedUsers[userID]);

  let returnval: roomCacheType = {};
  loadedUsers[userID].rooms.forEach((roomID) => {
    returnval[roomID] = loadedRooms[roomID];
  });
  return { roomsList: returnval };
};

export const userDisconnect = (userID: string) => {
  let error;
  error = unloadUsersRooms(userID)?.error;
  if (error) {
    return { error: error };
  }
  error = unloadUser(userID)?.error;
  if (error) {
    return { error: error };
  }
};

export const userDisconnect_R = async (userID: string) => {
  await Promise.all(
    loadedUsers[userID].rooms.map((roomID) => {
      if (
        loadedRooms[roomID].playerBlack == "" ||
        loadedRooms[roomID].playerWhite == ""
      ) {
        return unloadRoom_R(roomID);
      }
    })
  );

  await unloadUser_R(userID);
};

export const getUsersRooms = (userID: string) => {
  // if (!(userID in usersDB)) {
  //   return { error: `user ${userID} does not exist.` };
  // }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  let retVal: roomCacheType = {};
  loadedUsers[userID].rooms.forEach((roomID) => {
    if (!(roomID in roomsDB)) {
      return { error: `room ${roomID} does not exist.` };
    }

    if (!(roomID in loadedRooms)) {
      return { error: `room ${roomID} has not been loaded` };
    }
    retVal[roomID] = loadedRooms[roomID];
  });
  return retVal;
};

export const getRoomGame = (roomID: string) => {
  return loadedRooms[roomID].currentGameState;
};

export const saveSystemMessage = (roomID: string, msg: msgType) => {
  // if (!(roomID in roomsDB)) {
  //   return { error: `room ${roomID} does not exist.` };
  // }

  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  loadedRooms[roomID].history.push(msg);
};
export const saveMsg = (userID: string, roomID: string, msg: string) => {
  // if (!(userID in usersDB)) {
  //   return { error: `user ${userID} does not exist.` };
  // }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  // if (!(roomID in roomsDB)) {
  //   return { error: `room ${roomID} does not exist.` };
  // }

  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  loadedRooms[roomID].history.push({
    msg: msg,
    type: "msg",
    from: userID,
    to:
      loadedRooms[roomID].playerBlack == userID
        ? loadedRooms[roomID].playerWhite
        : loadedRooms[roomID].playerBlack,
  });
};

const createUserInDB = (userID: string) => {
  if (!(userID in usersDB)) {
    usersDB[userID] = {
      rooms: [],
    };
  } else {
    return { error: `user ${userID} already exists in DB.` };
  }
};

const createUserInDB_R = async (userID: string) => {
  return userModel.create({ userID: userID } as User);
};

export const userCreateNewRoom = (userID: string) => {
  const id = createRoomInDB();
  let err = loadRoom(id)?.error;
  if (err) {
    return { error: err };
  }
  let response = userJoinRoom(userID, id);
  let error = response?.error;
  let userError = response?.userError;
  if (error) {
    return { error: error };
  } else if (userError) {
    return { userError: userError };
  }

  let retVal = response.updatedRoom;
  return { newID: id, newRoom: retVal };
};

export const userCreateNewRoom_R = async (userID: string) => {
  const roomID = await createRoomInDB_R();

  let response = userJoinRoom(userID, roomID);
  let error = response?.error;
  let userError = response?.userError;
  if (error) {
    console.log(error);
    return { error: error };
  } else if (userError) {
    console.log(userError);
    return { userError: userError };
  }
  console.log("join room response: ");
  // console.log(response);
  console.log(loadedUsers[userID]);
  let retVal = response.updatedRoom;
  return { newID: roomID, newRoom: retVal };
};

const loadUser = (userID: string) => {
  if (!(userID in loadedUsers)) {
    if (!(userID in usersDB)) {
      return { error: `user ${userID} doesn't exist.` };
    }
    loadedUsers[userID] = usersDB[userID];
  }
};

const loadUser_R = async (userID: string) => {
  if (!(userID in loadedUsers)) {
    return userModel.findById(userID, (err, doc) => {
      if (err) {
        console.error(err);
      }

      if (doc) {
        loadedUsers[userID] = {
          rooms: doc.rooms,
        };
      }
    });
  }
};

const createRoomInDB = () => {
  let id = nanoid(10);
  while (id in roomsDB) {
    id = nanoid(10);
  }

  roomsDB[id] = {
    playerBlack: "",
    playerWhite: "",
    history: [
      {
        from: "",
        to: "",
        msg: board_default.toString(),
        type: "board",
      },
    ],
    currentGameStateFEN: newGameFEN,
  };

  return id;
};

const createRoomInDB_R = async () => {
  const newRoom = await roomModel.create({
    currentGameStateFEN: newGameFEN,
    playerBlack: "",
    playerWhite: "",
  } as Room);
  loadedRooms[newRoom.roomID] = {
    currentGameState: Chess(newRoom.currentGameStateFEN),
    history: [
      {
        from: "",
        to: "",
        msg: board_default.toString(),
        type: "board",
      },
    ],
    playerBlack: newRoom.playerBlack,
    playerWhite: newRoom.playerWhite,
  };
  console.log("New ID: ");
  console.log(newRoom.roomID);
  return newRoom.roomID;
};

const loadRoom = (roomID: string) => {
  if (!(roomID in loadedRooms)) {
    if (!(roomID in roomsDB)) {
      return { error: `room ${roomID} does not exist.` };
    }

    const dbEntry = roomsDB[roomID];
    loadedRooms[roomID] = {
      history: dbEntry.history,
      playerBlack: dbEntry.playerBlack,
      playerWhite: dbEntry.playerWhite,
      currentGameState: new Chess(dbEntry.currentGameStateFEN),
    };
  } else {
    return { error: `room ${roomID} is already loaded.` };
  }
};

const loadUsersRooms = (userID: string) => {
  if (!(userID in usersDB)) {
    return { error: `user ${userID} does not exist.` };
  }
  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded` };
  }

  loadedUsers[userID].rooms.forEach((roomID) => {
    if (!(roomID in roomsDB)) {
      return { error: `room ${roomID} does not exist.` };
    }

    if (!(roomID in loadedRooms)) {
      let error = loadRoom(roomID)?.error;
      if (error) {
        return { error: error };
      }
    }
  });
};

const unloadUsersRooms = (userID: string) => {
  if (!(userID in usersDB)) {
    return { error: `user ${userID} does not exist.` };
  }
  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded` };
  }

  loadedUsers[userID].rooms.forEach((roomID) => {
    if (
      loadedRooms[roomID].playerBlack == "" ||
      loadedRooms[roomID].playerWhite == ""
    ) {
      let error = unloadRoom(roomID)?.error;
      if (error) {
        return { error: error };
      }
    }
  });
};
const getRoomPlayerByString = (room: cachedRoomType, playerColor: string) => {
  if (playerColor == "playerBlack") {
    return room.playerBlack;
  } else if (playerColor == "playerWhite") {
    return room.playerWhite;
  } else {
    return { error: `${playerColor} is an invalid attribute for playerColor` };
  }
};

export const userJoinRoom = (userID: string, roomID: string) => {
  // if (!(userID in usersDB)) {
  //   return { error: `user ${userID} does not exist.` };
  // }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  // if (!(roomID in roomsDB)) {
  //   return { error: `room ${roomID} does not exist.` };
  // }

  if (!(roomID in loadedRooms)) {
    return {
      error: `room creator of ${roomID} must be active in order to join.`,
    };
  }

  const roles: Array<string> = ["playerWhite", "playerBlack"];
  const idx = Math.floor(Math.random() * 2);

  if (
    loadedRooms[roomID].playerBlack != "" &&
    loadedRooms[roomID].playerWhite != ""
  ) {
    return { userError: `room ${roomID} is full.` };
  }

  if (
    loadedRooms[roomID].playerBlack == userID ||
    loadedRooms[roomID].playerWhite == userID
  ) {
    return { userError: `user ${userID} is already in room ${roomID}. ` };
  }

  if (getRoomPlayerByString(loadedRooms[roomID], "playerBlack") == "") {
    loadedRooms[roomID].playerBlack = userID;
    //console.log(loadedRooms[roomID]);
  } else {
    loadedRooms[roomID].playerWhite = userID;
    //console.log(loadedRooms[roomID]);
  }
  console.log(roomID);
  loadedUsers[userID].rooms.push(roomID);
  console.log(loadedUsers[userID].rooms);
  return { updatedRoom: loadedRooms[roomID] };
};

export const userLeaveRoom = (userID: string, roomID: string) => {
  // if (!(userID in usersDB)) {
  //   return { error: `user ${userID} does not exist.` };
  // }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  // if (!(roomID in roomsDB)) {
  //   return { error: `room ${roomID} does not exist.` };
  // }

  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  if (loadedRooms[roomID].playerBlack == userID) {
    loadedRooms[roomID].playerBlack = "";
  } else if (loadedRooms[roomID].playerWhite == userID) {
    loadedRooms[roomID].playerWhite = "";
  } else {
    return {
      error: `room ${roomID} does not have user a ${userID} to remove.`,
    };
  }
  // delete particular room from user's cached room list.
  loadedUsers[userID].rooms = loadedUsers[userID].rooms.filter(
    (userRoomID) => userRoomID != roomID
  );
  if (
    loadedRooms[roomID].playerBlack == "" &&
    loadedRooms[roomID].playerWhite == ""
  ) {
    let error = disbandRoom(roomID)?.error;
    if (error) {
      return { error: error };
    }
  }
};

export const userLeaveRoom_R = (userID: string, roomID: string) => {
  // if (!(userID in usersDB)) {
  //   return { error: `user ${userID} does not exist.` };
  // }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  // if (!(roomID in roomsDB)) {
  //   return { error: `room ${roomID} does not exist.` };
  // }

  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  if (loadedRooms[roomID].playerBlack == userID) {
    loadedRooms[roomID].playerBlack = "";
  } else if (loadedRooms[roomID].playerWhite == userID) {
    loadedRooms[roomID].playerWhite = "";
  } else {
    return {
      error: `room ${roomID} does not have user a ${userID} to remove.`,
    };
  }
  // delete particular room from user's cached room list.
  loadedUsers[userID].rooms = loadedUsers[userID].rooms.filter(
    (userRoomID) => userRoomID != roomID
  );
  if (
    loadedRooms[roomID].playerBlack == "" &&
    loadedRooms[roomID].playerWhite == ""
  ) {
    disbandRoom_R(roomID)?.error;
  }
};

const disbandRoom = (roomID: string) => {
  if (!(roomID in roomsDB)) {
    return { error: `room ${roomID} does not exist.` };
  }

  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  if (
    loadedRooms[roomID].playerBlack != "" ||
    loadedRooms[roomID].playerWhite != ""
  ) {
    return { error: `cannot disband non-empty room ${roomID}` };
  } else {
    delete loadedRooms[roomID];
    delete roomsDB[roomID];
  }
};

const disbandRoom_R = (roomID: string) => {
  delete loadedRooms[roomID];
  return roomModel.findByIdAndDelete(roomID);
};

const unloadRoom = (roomID: string) => {
  if (!(roomID in roomsDB)) {
    return { error: `room ${roomID} does not exist.` };
  }

  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  const cachedEntry = loadedRooms[roomID];
  roomsDB[roomID] = {
    history: cachedEntry.history,
    playerBlack: cachedEntry.playerBlack,
    playerWhite: cachedEntry.playerWhite,
    currentGameStateFEN: cachedEntry.currentGameState.fen(),
  };
  delete loadedRooms[roomID];
};

const unloadRoom_R = async (roomID: string) => {
  const cachedEntry = loadedRooms[roomID];
  delete loadedRooms[roomID];
  //console.log("Cached Entry: ");
  //console.log(cachedEntry);
  return roomModel.findOneAndUpdate(
    { roomID: roomID },
    (err: any, doc: Room) => {
      if (err) {
        console.error(err);
      } else if (doc) {
        (doc.playerBlack = cachedEntry.playerBlack),
          (doc.playerWhite = cachedEntry.playerWhite),
          (doc.currentGameStateFEN = cachedEntry.currentGameState.fen());
        // @ts-ignore
        doc.save();
      }
    }
  );
};

const unloadUser = (userID: string) => {
  if (!(userID in usersDB)) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  usersDB[userID] = loadedUsers[userID];
  delete loadedUsers[userID];
};

const unloadUser_R = (userID: string) => {
  // if (!(userID in usersDB)) {
  //   return { error: `user ${userID} does not exist.` };
  // }

  // if (!(userID in loadedUsers)) {
  //   return { error: `user ${userID} has not been loaded.` };
  // }
  console.log(`user id: ${userID}: `);
  console.log(loadedUsers[userID]);
  return userModel.findOneAndUpdate(
    { userID: userID },
    {
      rooms: loadedUsers[userID].rooms,
    },
    // @ts-ignore
    { overwrite: true },
    () => {
      delete loadedUsers[userID];
    }
  );
};
export const getRoomPlayers = (roomID: string) => {
  if (!(roomID in roomsDB)) {
    return { error: `room ${roomID} does not exist.` };
  }

  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  return {
    playerBlack: loadedRooms[roomID].playerBlack,
    playerWhite: loadedRooms[roomID].playerWhite,
  };
};
