import { nanoid } from "nanoid";
import { PassThrough } from "stream";

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

interface roomType {
  playerBlack: string;
  playerWhite: string;
  history: Array<msgType>;
}

interface roomStoreType {
  [roomID: string]: roomType;
}

// const me = "miteshkumarca@gmail.com";
// const me2 = "kumarm4@rpi.edu"

const usersDB: userStoreType = {
  "miteshkumarca@gmail.com": {
    rooms: ["room1", "room2"],
  },
  "kumarm4@rpi.edu": {
    rooms: ["room1", "room2"],
  },
};

const roomsDB: roomStoreType = {
  room1: {
    playerBlack: "miteshkumarca@gmail.com",
    playerWhite: "kumarm4@rpi.edu",
    history: [
      {
        from: "miteshkumarca@gmail.com",
        to: "room1",
        type: "msg",
        msg: "HI GUY",
      },
    ],
  },
  room2: {
    playerWhite: "miteshkumarca@gmail.com",
    playerBlack: "kumarm4@rpi.edu",
    history: [
      {
        from: "kumarm4@rpi.edu",
        to: "room1",
        type: "msg",
        msg: "HI GUY",
      },
    ],
  },
};

let loadedRooms: roomStoreType = {};
let loadedUsers: userStoreType = {};

export const userConnect = (userID: string) => {
  let error;
  if (!(userID in usersDB)) {
    console.log(`Adding user ${userID} to DB`);
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

export const getMessageHist = (userID: string) => {
  if (!(userID in usersDB)) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  let returnval: roomStoreType = {};
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

export const getUsersRooms = (userID: string) => {
  if (!(userID in usersDB)) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  let retVal: roomStoreType = {};
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

export const saveMsg = (userID: string, roomID: string, msg: string) => {
  if (!(userID in usersDB)) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  if (!(roomID in roomsDB)) {
    return { error: `room ${roomID} does not exist.` };
  }

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

const loadUser = (userID: string) => {
  if (!(userID in loadedUsers)) {
    if (!(userID in usersDB)) {
      return { error: `user ${userID} doesn't exist.` };
    }
    loadedUsers[userID] = usersDB[userID];
  }

  // else {
  //   return { error: `user ${userID} already loaded.` };
  // }
};

const createRoomInDB = () => {
  let id = nanoid(10);
  while (id in roomsDB) {
    id = nanoid(10);
  }

  roomsDB[id] = {
    playerBlack: "",
    playerWhite: "",
    history: [],
  };

  return id;
};

const loadRoom = (roomID: string) => {
  if (!(roomID in loadedRooms)) {
    if (!(roomID in roomsDB)) {
      return { error: `room ${roomID} does not exist.` };
    }
    loadedRooms[roomID] = roomsDB[roomID];
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
const getRoomPlayerByString = (room: roomType, playerColor: string) => {
  if (playerColor == "playerBlack") {
    return room.playerBlack;
  } else if (playerColor == "playerWhite") {
    return room.playerWhite;
  } else {
    return { error: `${playerColor} is an invalid attribute for playerColor` };
  }
};

export const userJoinRoom = (userID: string, roomID: string) => {
  if (!(userID in usersDB)) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  if (!(roomID in roomsDB)) {
    return { error: `room ${roomID} does not exist.` };
  }

  if (!(roomID in loadedRooms)) {
    return { error: `room ${roomID} has not been loaded` };
  }

  const roles: Array<string> = ["playerWhite", "playerBlack"];
  const idx = Math.floor(Math.random() * 2);

  if (
    loadedRooms[roomID].playerBlack != "" &&
    loadedRooms[roomID].playerWhite != ""
  ) {
    return { userError: `room ${roomID} is full. ` };
  }

  if (
    loadedRooms[roomID].playerBlack == userID ||
    loadedRooms[roomID].playerWhite == userID
  ) {
    return { userError: `user ${userID} is already in room ${roomID}. ` };
  }

  if (getRoomPlayerByString(loadedRooms[roomID], "playerBlack") == "") {
    loadedRooms[roomID].playerBlack = userID;
    console.log(loadedRooms[roomID]);
  } else {
    loadedRooms[roomID].playerWhite = userID;
    console.log(loadedRooms[roomID]);
  }
  loadedUsers[userID].rooms.push(roomID);

  return { updatedRoom: loadedRooms[roomID] };
};

export const userLeaveRoom = (userID: string, roomID: string) => {
  if (!(userID in usersDB)) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!(userID in loadedUsers)) {
    return { error: `user ${userID} has not been loaded.` };
  }

  if (!(roomID in roomsDB)) {
    return { error: `room ${roomID} does not exist.` };
  }

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

  roomsDB[roomID] = loadedRooms[roomID];
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
