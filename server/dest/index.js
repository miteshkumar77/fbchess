"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
var dotenv = __importStar(require("dotenv"));
var express_1 = __importDefault(require("express"));
var socket_io_1 = __importDefault(require("socket.io"));
var http_1 = __importDefault(require("http"));
var router_1 = __importDefault(require("./router"));
var game_1 = require("./game");
dotenv.config();
var crud_1 = require("./crud");
var models_1 = require("./models");
var PORT = process.env.PORT || 4000;
var error;
var userSocket = {};
var app = express_1.default();
var server = http_1.default.createServer(app);
var io = socket_io_1.default(server);
app.use(router_1.default);
if (process.env.ENV === "PRODUCTION") {
    app.use("/", express_1.default.static("../../client/build/static"));
}
io.on("connection", function (socket) {
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
    socket.on("initialize", function (email, callback) {
        console.log("Connecting user " + email + ".");
        crud_1.userConnect_R(email, function () {
            var response = crud_1.getMessageHist(email);
            console.log(response);
            userSocket[email] = socket.id;
            if (response.roomsList) {
                socket.join(Object.keys(response.roomsList));
            }
            callback({ hist: response.roomsList });
        });
    });
    socket.on("outbound_message", function (roomID, message) {
        crud_1.saveMsg(message.from, roomID, message.msg);
        io.in(roomID).emit("message", roomID, message);
        if (message.msg.length > 9 && message.msg.substring(0, 9) === "@fbchess ") {
            var roomPlayers = crud_1.getRoomPlayers(roomID);
            console.log(roomPlayers);
            var pW = roomPlayers.playerWhite ? roomPlayers.playerWhite : "";
            var pB = roomPlayers.playerBlack ? roomPlayers.playerBlack : "";
            var systemMsg = game_1.getGameCmd(crud_1.getRoomGame(roomID), message.from, pW, pB, message.msg.substring(9));
            crud_1.saveSystemMessage(roomID, systemMsg);
            io.to(roomID).emit("message", roomID, systemMsg);
        }
    });
    // socket.on("deinitialize", (email: string, callback) => {
    //   delete userSocket[email];
    //   socket.leaveAll();
    //   userDisconnect(email);
    //   callback();
    // });
    socket.on("deinitialize", function (email, callback) {
        console.log("Disconnecting " + email + ".");
        delete userSocket[email];
        socket.leaveAll();
        crud_1.userDisconnect_R(email);
        callback();
    });
    socket.on("join_room", function (userID, roomID, callback) {
        var result = crud_1.userJoinRoom(userID, roomID);
        var error = result === null || result === void 0 ? void 0 : result.error;
        var userError = result === null || result === void 0 ? void 0 : result.userError;
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
                io.to(userSocket[result.updatedRoom.playerBlack]).emit("incoming_room", crud_1.getUsersRooms(result.updatedRoom.playerBlack));
            }
            if (result.updatedRoom.playerWhite in userSocket) {
                io.to(userSocket[result.updatedRoom.playerWhite]).emit("incoming_room", crud_1.getUsersRooms(result.updatedRoom.playerWhite));
            }
        }
    });
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
    socket.on("leave_room", function (userID, roomID, callback) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, playerBlack, playerWhite, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = crud_1.getRoomPlayers(roomID), playerBlack = _a.playerBlack, playerWhite = _a.playerWhite, error = _a.error;
                    if (error) {
                        callback({ error: error });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, crud_1.userLeaveRoom_R(userID, roomID)];
                case 1:
                    _b.sent();
                    if (playerBlack && playerBlack in userSocket) {
                        io.to(userSocket[playerBlack]).emit("incoming_room", crud_1.getUsersRooms(playerBlack));
                    }
                    if (playerWhite && playerWhite in userSocket) {
                        io.to(userSocket[playerWhite]).emit("incoming_room", crud_1.getUsersRooms(playerWhite));
                    }
                    return [2 /*return*/];
            }
        });
    }); });
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
    socket.on("new_room", function (userID, callback) { return __awaiter(void 0, void 0, void 0, function () {
        var newRoom;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, crud_1.userCreateNewRoom_R(userID)];
                case 1:
                    newRoom = _a.sent();
                    console.log(crud_1.getUsersRooms(userID));
                    if (newRoom) {
                        socket.join(newRoom.newRoomID);
                        io.to(userSocket[userID]).emit("incoming_room", crud_1.getUsersRooms(userID));
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on("disconnect", function () {
        console.log("A use left.");
    });
});
models_1.mongoBegin(function () {
    server.listen(PORT, function () {
        console.log("Server started on port " + PORT);
    });
});
//# sourceMappingURL=index.js.map