import { nanoid } from "nanoid";
import { Chess, ChessInstance } from "chess.js";
import { board_default } from "./board_formulas";
import {
  User,
  IMessage,
  IRoom,
  IUser,
  MessageSchema,
  Room,
  RoomSchema,
  UserSchema,
  findOrCreateUser,
  Message,
  createNewRoom,
} from "./models";
import { realpathSync } from "fs";

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

/**
 *
 * @param userID user email
 * @effects loads user's data as well as the rooms that the user is part of
 *          if they have not been loaded already from the database, into memory.
 *
 */
export const userConnect_R = async (userID: string, callback: any) => {
  if (userID in loadedUsers) {
    callback();
    return;
  } else {
    let user = await findOrCreateUser(userID);
    if (user) {
      loadedUsers[user.userID] = {
        rooms: user.rooms,
      };

      let newRooms = await Promise.all(
        loadedUsers[user.userID].rooms.map((roomID) => {
          if (!(roomID in loadedRooms)) {
            return Room.findOne({ roomID: roomID });
          }
        })
      );

      newRooms.forEach((res) => {
        if (res) {
          loadedRooms[res.roomID] = {
            currentGameState: new Chess(res.currentGameStateFEN),
            playerBlack: res.playerBlack,
            playerWhite: res.playerWhite,
            history: res.history,
          };
        }
      });
    }
  }

  callback();
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

/**
 *
 * @param userID user's email
 * @effects Unloads any rooms that have both users disconnected and
 * then unloads the user's current data into the database.
 */
export const userDisconnect_R = async (userID: string) => {
  // unload all rooms that will have 0 connected users.
  try {
    await Promise.all(
      loadedUsers[userID].rooms.map((roomID) => {
        if (
          !(loadedRooms[roomID].playerBlack in loadedRooms[roomID]) ||
          !(loadedRooms[roomID].playerWhite in loadedRooms[roomID])
        ) {
          return Room.findOneAndUpdate(
            { roomID: roomID },
            {
              $set: {
                playerBlack: loadedRooms[roomID].playerBlack,
                playerWhite: loadedRooms[roomID].playerWhite,
                currentGameStateFEN: loadedRooms[roomID].currentGameState.fen(),
                history: loadedRooms[roomID].history.map((msg: msgType) => {
                  return new Message({
                    to: msg.to,
                    from: msg.from,
                    msg: msg.msg,
                    type: msg.type,
                  });
                }),
              },
            },
            () => {
              delete loadedRooms[roomID];
            }
          );
        }
      })
    );
  } catch (err) {
    console.error(err);
  }

  // unload the disconnecting user's data
  try {
    User.findOneAndUpdate(
      { userID: userID },
      { $set: { rooms: loadedUsers[userID].rooms } },
      () => {
        delete loadedUsers[userID];
      }
    );
  } catch (err) {
    console.error(err);
    return;
  }
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
    // if (!(roomID in roomsDB)) {
    //   return { error: `room ${roomID} does not exist.` };
    // }

    // if (!(roomID in loadedRooms)) {
    //   return { error: `room ${roomID} has not been loaded` };
    // }
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

/**
 *
 * @param userID user's email
 * @effects creates a new room in the database, loads the room into memory, and joins the user to the room.
 * @returns new ID and new room instance.
 */
export const userCreateNewRoom_R = async (userID: string) => {
  let newRoom = await createNewRoom();
  if (!newRoom) {
    return;
  }
  const id = newRoom.roomID;
  loadedRooms[id] = {
    currentGameState: new Chess(newRoom.currentGameStateFEN),
    history: newRoom.history,
    playerBlack: newRoom.playerBlack,
    playerWhite: newRoom.playerWhite,
  };
  userJoinRoom(userID, id);

  return { newRoomID: id, newRoom: loadedRooms[id] };
};

const loadUser = (userID: string) => {
  if (!(userID in loadedUsers)) {
    if (!(userID in usersDB)) {
      return { error: `user ${userID} doesn't exist.` };
    }
    loadedUsers[userID] = usersDB[userID];
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
      !(loadedRooms[roomID].playerBlack in loadedUsers) ||
      !(loadedRooms[roomID].playerWhite in loadedUsers)
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

/**
 *
 * @param userID user's email
 * @param roomID room's unique ID
 * @effects removes user's name from room, if both users have left the room,
 * the room is deleted from both the database and memory.
 */
export const userLeaveRoom_R = async (userID: string, roomID: string) => {
  if (loadedRooms[roomID].playerBlack == userID) {
    loadedRooms[roomID].playerBlack = "";
  } else if (loadedRooms[roomID].playerWhite == userID) {
    loadedRooms[roomID].playerWhite = "";
  }
  loadedUsers[userID].rooms = loadedUsers[userID].rooms.filter(
    (userRoomID) => userRoomID != roomID
  );

  if (
    loadedRooms[roomID].playerBlack == "" &&
    loadedRooms[roomID].playerWhite == ""
  ) {
    Room.findOneAndDelete({ roomID: roomID }, () => {
      delete loadedRooms[roomID];
    });
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

export const getRoomPlayers = (roomID: string) => {
  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  return {
    playerBlack: loadedRooms[roomID].playerBlack,
    playerWhite: loadedRooms[roomID].playerWhite,
  };
};
