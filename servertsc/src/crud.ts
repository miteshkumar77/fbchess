import { nanoid } from "nanoid";
import { PassThrough } from "stream";

interface userStoreType {
  [userID: string]: {
    rooms: Array<string>;
  };
}

interface msgType {
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

const loadedRooms: roomStoreType = {};
const loadedUsers: userStoreType = {};

export const userConnect = (userID: string) => {};

export const userDisconnect = (userID: string) => {};

export const userTransportMsg = (
  userID: string,
  roomID: string,
  msg: msgType
) => {};

const createUserInDB = (userID: string) => {};

export const userCreateNewRoom = (userID: string) => {};

const loadUser = (userID: string) => {};

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

const loadRoom = (roomID: string) => {};

const loadUsersRoom = (userID: string) => {};

export const userJoinRoom = (userID: string, roomID: string) => {};

export const userLeaveRoom = (userID: string, roomID: string) => {};

const disbandRoom = (roomID: string) => {};

const unloadRoom = (roomID: string) => {};

const unloadUser = (userID: string) => {};
