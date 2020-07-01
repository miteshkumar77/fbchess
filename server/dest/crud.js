"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomPlayers = exports.userLeaveRoom_R = exports.userLeaveRoom = exports.userJoinRoom = exports.userCreateNewRoom_R = exports.userCreateNewRoom = exports.saveMsg = exports.saveSystemMessage = exports.getRoomGame = exports.getUsersRooms = exports.userDisconnect_R = exports.userDisconnect = exports.getMessageHist = exports.userConnect_R = exports.userConnect = void 0;
var nanoid_1 = require("nanoid");
var chess_js_1 = require("chess.js");
var board_formulas_1 = require("./board_formulas");
var models_1 = require("./models");
var newGameFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
var roomsDB = {};
var usersDB = {};
var loadedRooms = {};
var loadedUsers = {};
exports.userConnect = function (userID) {
    var _a, _b, _c;
    var error;
    if (!(userID in usersDB)) {
        //console.log(`Adding user ${userID} to DB`);
        error = (_a = createUserInDB(userID)) === null || _a === void 0 ? void 0 : _a.error;
        if (error) {
            return { error: error };
        }
    }
    error = (_b = loadUser(userID)) === null || _b === void 0 ? void 0 : _b.error;
    if (error) {
        return { error: error };
    }
    error = (_c = loadUsersRooms(userID)) === null || _c === void 0 ? void 0 : _c.error;
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
exports.userConnect_R = function (userID, callback) { return __awaiter(void 0, void 0, void 0, function () {
    var user, newRooms;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(userID in loadedUsers)) return [3 /*break*/, 1];
                callback();
                return [2 /*return*/];
            case 1: return [4 /*yield*/, models_1.findOrCreateUser(userID)];
            case 2:
                user = _a.sent();
                if (!user) return [3 /*break*/, 4];
                loadedUsers[user.userID] = {
                    rooms: user.rooms,
                };
                return [4 /*yield*/, Promise.all(loadedUsers[user.userID].rooms.map(function (roomID) {
                        if (!(roomID in loadedRooms)) {
                            return models_1.Room.findOne({ roomID: roomID });
                        }
                    }))];
            case 3:
                newRooms = _a.sent();
                newRooms.forEach(function (res) {
                    if (res) {
                        loadedRooms[res.roomID] = {
                            currentGameState: new chess_js_1.Chess(res.currentGameStateFEN),
                            playerBlack: res.playerBlack,
                            playerWhite: res.playerWhite,
                            history: res.history,
                        };
                    }
                });
                _a.label = 4;
            case 4:
                callback();
                return [2 /*return*/];
        }
    });
}); };
exports.getMessageHist = function (userID) {
    // if (!(userID in usersDB)) {
    //   return { error: `user ${userID} does not exist.` };
    // }
    if (!(userID in loadedUsers)) {
        return { error: "user " + userID + " has not been loaded." };
    }
    //console.log("User Loaded: ");
    //console.log(loadedUsers[userID]);
    var returnval = {};
    loadedUsers[userID].rooms.forEach(function (roomID) {
        returnval[roomID] = loadedRooms[roomID];
    });
    return { roomsList: returnval };
};
exports.userDisconnect = function (userID) {
    var _a, _b;
    var error;
    error = (_a = unloadUsersRooms(userID)) === null || _a === void 0 ? void 0 : _a.error;
    if (error) {
        return { error: error };
    }
    error = (_b = unloadUser(userID)) === null || _b === void 0 ? void 0 : _b.error;
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
exports.userDisconnect_R = function (userID) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Promise.all(loadedUsers[userID].rooms.map(function (roomID) {
                        if (!(loadedRooms[roomID].playerBlack in loadedRooms[roomID]) ||
                            !(loadedRooms[roomID].playerWhite in loadedRooms[roomID])) {
                            return models_1.Room.findOneAndUpdate({ roomID: roomID }, {
                                $set: {
                                    playerBlack: loadedRooms[roomID].playerBlack,
                                    playerWhite: loadedRooms[roomID].playerWhite,
                                    currentGameStateFEN: loadedRooms[roomID].currentGameState.fen(),
                                    history: loadedRooms[roomID].history.map(function (msg) {
                                        return new models_1.Message({
                                            to: msg.to,
                                            from: msg.from,
                                            msg: msg.msg,
                                            type: msg.type,
                                        });
                                    }),
                                },
                            }, function () {
                                delete loadedRooms[roomID];
                            });
                        }
                    }))];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error(err_1);
                return [3 /*break*/, 3];
            case 3:
                // unload the disconnecting user's data
                try {
                    models_1.User.findOneAndUpdate({ userID: userID }, { $set: { rooms: loadedUsers[userID].rooms } }, function () {
                        delete loadedUsers[userID];
                    });
                }
                catch (err) {
                    console.error(err);
                    return [2 /*return*/];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.getUsersRooms = function (userID) {
    // if (!(userID in usersDB)) {
    //   return { error: `user ${userID} does not exist.` };
    // }
    if (!(userID in loadedUsers)) {
        return { error: "user " + userID + " has not been loaded." };
    }
    var retVal = {};
    loadedUsers[userID].rooms.forEach(function (roomID) {
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
exports.getRoomGame = function (roomID) {
    return loadedRooms[roomID].currentGameState;
};
exports.saveSystemMessage = function (roomID, msg) {
    // if (!(roomID in roomsDB)) {
    //   return { error: `room ${roomID} does not exist.` };
    // }
    if (!(roomID in loadedRooms)) {
        return { error: "room " + roomID + " has not been loaded" };
    }
    loadedRooms[roomID].history.push(msg);
};
exports.saveMsg = function (userID, roomID, msg) {
    // if (!(userID in usersDB)) {
    //   return { error: `user ${userID} does not exist.` };
    // }
    if (!(userID in loadedUsers)) {
        return { error: "user " + userID + " has not been loaded." };
    }
    // if (!(roomID in roomsDB)) {
    //   return { error: `room ${roomID} does not exist.` };
    // }
    if (!(roomID in loadedRooms)) {
        return { error: "room " + roomID + " has not been loaded" };
    }
    loadedRooms[roomID].history.push({
        msg: msg,
        type: "msg",
        from: userID,
        to: loadedRooms[roomID].playerBlack == userID
            ? loadedRooms[roomID].playerWhite
            : loadedRooms[roomID].playerBlack,
    });
};
var createUserInDB = function (userID) {
    if (!(userID in usersDB)) {
        usersDB[userID] = {
            rooms: [],
        };
    }
    else {
        return { error: "user " + userID + " already exists in DB." };
    }
};
exports.userCreateNewRoom = function (userID) {
    var _a;
    var id = createRoomInDB();
    var err = (_a = loadRoom(id)) === null || _a === void 0 ? void 0 : _a.error;
    if (err) {
        return { error: err };
    }
    var response = exports.userJoinRoom(userID, id);
    var error = response === null || response === void 0 ? void 0 : response.error;
    var userError = response === null || response === void 0 ? void 0 : response.userError;
    if (error) {
        return { error: error };
    }
    else if (userError) {
        return { userError: userError };
    }
    var retVal = response.updatedRoom;
    return { newID: id, newRoom: retVal };
};
/**
 *
 * @param userID user's email
 * @effects creates a new room in the database, loads the room into memory, and joins the user to the room.
 * @returns new ID and new room instance.
 */
exports.userCreateNewRoom_R = function (userID) { return __awaiter(void 0, void 0, void 0, function () {
    var newRoom, id;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, models_1.createNewRoom()];
            case 1:
                newRoom = _a.sent();
                if (!newRoom) {
                    return [2 /*return*/];
                }
                id = newRoom.roomID;
                loadedRooms[id] = {
                    currentGameState: new chess_js_1.Chess(newRoom.currentGameStateFEN),
                    history: newRoom.history,
                    playerBlack: newRoom.playerBlack,
                    playerWhite: newRoom.playerWhite,
                };
                exports.userJoinRoom(userID, id);
                return [2 /*return*/, { newRoomID: id, newRoom: loadedRooms[id] }];
        }
    });
}); };
var loadUser = function (userID) {
    if (!(userID in loadedUsers)) {
        if (!(userID in usersDB)) {
            return { error: "user " + userID + " doesn't exist." };
        }
        loadedUsers[userID] = usersDB[userID];
    }
};
var createRoomInDB = function () {
    var id = nanoid_1.nanoid(10);
    while (id in roomsDB) {
        id = nanoid_1.nanoid(10);
    }
    roomsDB[id] = {
        playerBlack: "",
        playerWhite: "",
        history: [
            {
                from: "",
                to: "",
                msg: board_formulas_1.board_default.toString(),
                type: "board",
            },
        ],
        currentGameStateFEN: newGameFEN,
    };
    return id;
};
var loadRoom = function (roomID) {
    if (!(roomID in loadedRooms)) {
        if (!(roomID in roomsDB)) {
            return { error: "room " + roomID + " does not exist." };
        }
        var dbEntry = roomsDB[roomID];
        loadedRooms[roomID] = {
            history: dbEntry.history,
            playerBlack: dbEntry.playerBlack,
            playerWhite: dbEntry.playerWhite,
            currentGameState: new chess_js_1.Chess(dbEntry.currentGameStateFEN),
        };
    }
    else {
        return { error: "room " + roomID + " is already loaded." };
    }
};
var loadUsersRooms = function (userID) {
    if (!(userID in usersDB)) {
        return { error: "user " + userID + " does not exist." };
    }
    if (!(userID in loadedUsers)) {
        return { error: "user " + userID + " has not been loaded" };
    }
    loadedUsers[userID].rooms.forEach(function (roomID) {
        var _a;
        if (!(roomID in roomsDB)) {
            return { error: "room " + roomID + " does not exist." };
        }
        if (!(roomID in loadedRooms)) {
            var error = (_a = loadRoom(roomID)) === null || _a === void 0 ? void 0 : _a.error;
            if (error) {
                return { error: error };
            }
        }
    });
};
var unloadUsersRooms = function (userID) {
    if (!(userID in usersDB)) {
        return { error: "user " + userID + " does not exist." };
    }
    if (!(userID in loadedUsers)) {
        return { error: "user " + userID + " has not been loaded" };
    }
    loadedUsers[userID].rooms.forEach(function (roomID) {
        var _a;
        if (!(loadedRooms[roomID].playerBlack in loadedUsers) ||
            !(loadedRooms[roomID].playerWhite in loadedUsers)) {
            var error = (_a = unloadRoom(roomID)) === null || _a === void 0 ? void 0 : _a.error;
            if (error) {
                return { error: error };
            }
        }
    });
};
var getRoomPlayerByString = function (room, playerColor) {
    if (playerColor == "playerBlack") {
        return room.playerBlack;
    }
    else if (playerColor == "playerWhite") {
        return room.playerWhite;
    }
    else {
        return { error: playerColor + " is an invalid attribute for playerColor" };
    }
};
exports.userJoinRoom = function (userID, roomID) {
    // if (!(userID in usersDB)) {
    //   return { error: `user ${userID} does not exist.` };
    // }
    if (!(userID in loadedUsers)) {
        return { error: "user " + userID + " has not been loaded." };
    }
    // if (!(roomID in roomsDB)) {
    //   return { error: `room ${roomID} does not exist.` };
    // }
    if (!(roomID in loadedRooms)) {
        return {
            error: "room creator of " + roomID + " must be active in order to join.",
        };
    }
    var roles = ["playerWhite", "playerBlack"];
    var idx = Math.floor(Math.random() * 2);
    if (loadedRooms[roomID].playerBlack != "" &&
        loadedRooms[roomID].playerWhite != "") {
        return { userError: "room " + roomID + " is full." };
    }
    if (loadedRooms[roomID].playerBlack == userID ||
        loadedRooms[roomID].playerWhite == userID) {
        return { userError: "user " + userID + " is already in room " + roomID + ". " };
    }
    if (getRoomPlayerByString(loadedRooms[roomID], "playerBlack") == "") {
        loadedRooms[roomID].playerBlack = userID;
        //console.log(loadedRooms[roomID]);
    }
    else {
        loadedRooms[roomID].playerWhite = userID;
        //console.log(loadedRooms[roomID]);
    }
    console.log(roomID);
    loadedUsers[userID].rooms.push(roomID);
    console.log(loadedUsers[userID].rooms);
    return { updatedRoom: loadedRooms[roomID] };
};
exports.userLeaveRoom = function (userID, roomID) {
    // if (!(userID in usersDB)) {
    //   return { error: `user ${userID} does not exist.` };
    // }
    var _a;
    if (!(userID in loadedUsers)) {
        return { error: "user " + userID + " has not been loaded." };
    }
    // if (!(roomID in roomsDB)) {
    //   return { error: `room ${roomID} does not exist.` };
    // }
    if (!(roomID in loadedRooms)) {
        return { error: "room " + roomID + " has not been loaded" };
    }
    if (loadedRooms[roomID].playerBlack == userID) {
        loadedRooms[roomID].playerBlack = "";
    }
    else if (loadedRooms[roomID].playerWhite == userID) {
        loadedRooms[roomID].playerWhite = "";
    }
    else {
        return {
            error: "room " + roomID + " does not have user a " + userID + " to remove.",
        };
    }
    // delete particular room from user's cached room list.
    loadedUsers[userID].rooms = loadedUsers[userID].rooms.filter(function (userRoomID) { return userRoomID != roomID; });
    if (loadedRooms[roomID].playerBlack == "" &&
        loadedRooms[roomID].playerWhite == "") {
        var error = (_a = disbandRoom(roomID)) === null || _a === void 0 ? void 0 : _a.error;
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
exports.userLeaveRoom_R = function (userID, roomID) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (loadedRooms[roomID].playerBlack == userID) {
            loadedRooms[roomID].playerBlack = "";
        }
        else if (loadedRooms[roomID].playerWhite == userID) {
            loadedRooms[roomID].playerWhite = "";
        }
        loadedUsers[userID].rooms = loadedUsers[userID].rooms.filter(function (userRoomID) { return userRoomID != roomID; });
        if (loadedRooms[roomID].playerBlack == "" &&
            loadedRooms[roomID].playerWhite == "") {
            models_1.Room.findOneAndDelete({ roomID: roomID }, function () {
                delete loadedRooms[roomID];
            });
        }
        return [2 /*return*/];
    });
}); };
var disbandRoom = function (roomID) {
    if (!(roomID in roomsDB)) {
        return { error: "room " + roomID + " does not exist." };
    }
    if (!(roomID in loadedRooms)) {
        return { error: "room " + roomID + " has not been loaded" };
    }
    if (loadedRooms[roomID].playerBlack != "" ||
        loadedRooms[roomID].playerWhite != "") {
        return { error: "cannot disband non-empty room " + roomID };
    }
    else {
        delete loadedRooms[roomID];
        delete roomsDB[roomID];
    }
};
var unloadRoom = function (roomID) {
    if (!(roomID in roomsDB)) {
        return { error: "room " + roomID + " does not exist." };
    }
    if (!(roomID in loadedRooms)) {
        return { error: "room " + roomID + " has not been loaded" };
    }
    var cachedEntry = loadedRooms[roomID];
    roomsDB[roomID] = {
        history: cachedEntry.history,
        playerBlack: cachedEntry.playerBlack,
        playerWhite: cachedEntry.playerWhite,
        currentGameStateFEN: cachedEntry.currentGameState.fen(),
    };
    delete loadedRooms[roomID];
};
var unloadUser = function (userID) {
    if (!(userID in usersDB)) {
        return { error: "user " + userID + " does not exist." };
    }
    if (!(userID in loadedUsers)) {
        return { error: "user " + userID + " has not been loaded." };
    }
    usersDB[userID] = loadedUsers[userID];
    delete loadedUsers[userID];
};
exports.getRoomPlayers = function (roomID) {
    if (!(roomID in loadedRooms)) {
        return { error: "room " + roomID + " has not been loaded" };
    }
    return {
        playerBlack: loadedRooms[roomID].playerBlack,
        playerWhite: loadedRooms[roomID].playerWhite,
    };
};
//# sourceMappingURL=crud.js.map