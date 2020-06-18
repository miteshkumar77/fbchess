const nanoid = require("nanoid");

const usersDB = {
  "miteshkumarca@gmail.com": {
    rooms: ["room1", "room2"],
  },
  "kumarm4@rpi.edu": {
    rooms: ["room1", "room2"],
  },
};

const roomsDB = {
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
    history: {
      from: "kumarm4@rpi.edu",
      to: "room1",
      type: "msg",
      msg: "HI GUY",
    },
  },
};

const loadedRooms = {};

const loadedUsers = {};

const userConnect = ({ userID }) => {
  console.log(`Connectiong ${userID}.`);
  if (!userID in usersDB) {
    let { error, userError } = createUserInDB({ userID: userID });
    if (error) {
      return { error: error };
    }
  }
  let { error } = loadUser({ userID: userID });
  if (error) {
    return { error: error };
  }
  error = loadUsersRooms({ userID: userID }).error;
  if (error) {
    return { error: error };
  }
  return {
    usersRooms: loadedUsers[userID].rooms.map((roomID) => {
      return loadedRooms[roomID];
    }),
  };
  console.log(loadedUsers);
};

const userDisconnect = ({ userID }) => {
  if (!userID in usersDB) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!userID in loadedUsers) {
    return { error: `user ${userID} has not been loaded.` };
  }

  console.log(loadedUsers);
  console.log(userID);
  console.log(loadedUsers[userID]);
  loadedUsers[userID].forEach((roomID) => {
    let usersInARoom = 0;
    if (loadedRooms[roomID].playerBlack in loadedUsers) {
      ++usersInARoom;
    }

    if (loadedRooms[roomID].playerWhite in loadedUsers) {
      ++usersInARoom;
    }

    if (usersInARoom < 2) {
      let { error, userError } = unloadRoom({ roomID: roomID });
    }
  });
  unloadUser({ userID: userID });
};

const userTransportMsg = ({ userID, roomID, msg }) => {
  if (!userID in usersDB) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!userID in loadedUsers) {
    return { error: `user ${userID} has not been loaded.` };
  }

  if (!roomID in roomsDB) {
    return { error: `room ${roomID} does not exist.` };
  }

  if (!roomID in loadedRooms) {
    return { error: `room ${roomID} has not been loaded` };
  }

  if (
    userID != loadedRooms[roomID].playerBlack &&
    userID != loadedRooms[roomID].playerWhite
  ) {
    return { error: `user ${userID} is not in room ${roomID}.` };
  }

  loadedRooms[roomID].history = [
    ...loadedRooms[roomID].history,
    {
      to: msg.to,
      from: msg.from,
      msg: msg.msg,
      type: msg.type,
    },
  ];
};

const createUserInDB = ({ userID }) => {
  if (!userID in usersDB) {
    usersDB[userID] = {
      rooms: [],
    };
  } else {
    return { error: `user ${userID} already exists in DB. ` };
  }
};

const userCreateNewRoom = ({ userID }) => {
  const id = createRoomInDB();
  loadRoom({ roomID: id });
  userJoinRoom({ userID: userID, roomID: id });
};

const loadUser = ({ userID }) => {
  if (!userID in loadedUsers) {
    if (!userID in usersDB) {
      createUserInDB({ userID: userID });
    } else {
      return { error: "user doesn't exist." };
    }
    loadedUsers[userID] = usersDB[userID];
  } else {
    return { error: "user already loaded." };
  }
};

const createRoomInDB = () => {
  let id = nanoid(10);
  // Keep generating a new nanoid until
  // a free nanoid is found.
  // Its HIGHLY UNLIKELY to enter loop
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

const loadRoom = ({ roomID }) => {
  if (roomID in roomsDB) {
    loadedRooms[roomID] = roomsDB;
  } else {
    return { error: `room ${roomID} does not exist.` };
  }
};

const loadUsersRooms = ({ userID }) => {
  if (!userID in usersDB) {
    return { error: `user ${userID} does not exist.` };
  }
  if (!userID in loadedUsers) {
    return { error: `user ${userID} has not been loaded` };
  }
  loadedUsers[userID].rooms.forEach((room) => {
    if (!room in loadedRooms) {
      if (!room in roomsDB) {
        return { error: `room ${room} does not exist.` };
      }

      loadRoom({ roomID: roomID });
    }
  });
};

const userJoinRoom = ({ userID, roomID }) => {
  const roles = ["playerWhite", "playerBlack"];
  const idx = Math.floor(Math.random() * 2);

  if (!userID in usersDB) {
    return { error: `user ${userID} does not exist.` };
  }

  if (!userID in loadedUsers) {
    return { error: `user ${userID} has not been loaded.` };
  }

  if (!roomID in roomsDB) {
    return { error: `room ${roomID} does not exist.` };
  }

  if (!roomID in loadedRooms) {
    return { error: `room ${roomID} has not been loaded` };
  }

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
    return { userError: `user ${userID} is already in room ${roomID}.` };
  }

  if (loadedRooms[roomID][roles[idx]] == "") {
    loadedRooms[roomID][roles[idx]] = userID;
  } else {
    loadedRooms[roomID][(roles[idx] + 1) % 2] = userID;
  }
};

const userLeaveRoom = ({ userID, roomID }) => {
  if (!userID in usersDB) {
    return { error: `user ${userID} does not exist.` };
  }
  if (!userID in loadedUsers) {
    return { error: `user ${userID} has not been loaded` };
  }
  if (!roomID in roomsDB) {
    return { error: `room ${roomID} does not exist.` };
  }
  if (!roomID in loadedRooms) {
    return { error: `room ${roomID} has not been loaded` };
  }

  if (loadedRooms[roomID].playerBlack == userID) {
    loadedRooms[roomID].playerBlack = "";
  } else if (loadedRooms[roomID].playerWhite == userID) {
    loadedRooms[roomID].playerWhite = "";
  } else {
    return { error: `room ${roomID} does not have user ${userID}` };
  }

  if (
    loadedRooms[roomID].playerBlack == "" &&
    loadedRooms[roomID].playerWhite == ""
  ) {
    disbandRoom({ roomID: roomID });
  }
};

const disbandRoom = ({ roomID }) => {
  if (!roomID in roomsDB) {
    return { error: `room ${roomID} does not exist.` };
  }
  if (!roomID in loadedRooms) {
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

const unloadRoom = ({ roomID }) => {
  if (!roomID in roomsDB) {
    return { error: `room ${roomID} does not exist.` };
  }
  if (!roomID in loadedRooms) {
    return { error: `room ${roomID} has not been loaded` };
  }

  roomsDB[roomID] = loadedRooms[roomID];
  delete loadedRooms[roomID];
};

const unloadUser = ({ userID }) => {
  if (!userID in usersDB) {
    return { error: `user ${userID} does not exist.` };
  }
  if (!userID in loadedUsers) {
    return { error: `user ${userID} has not been loaded` };
  }

  usersDB[userID] = loadedUsers[userID];
  delete loadedUsers[userID];
};
module.exports.userConnect = userConnect;
module.exports.userDisconnect = userDisconnect;
module.exports.userLeaveRoom = userLeaveRoom;
module.exports.userJoinRoom = userJoinRoom;
module.exports.userCreateNewRoom = userCreateNewRoom;
module.exports.userTransportMsg = userTransportMsg;
