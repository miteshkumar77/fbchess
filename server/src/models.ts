import * as dotenv from "dotenv";
import mongoose = require("mongoose");
import { nanoid } from "nanoid";
const newGameFEN: string =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
import { board_default } from "./board_formulas";
dotenv.config();

if (!process.env.DATABASE_DEV) {
  console.error("DB connection string not found. Exiting...");
  process.exit();
}
const db_uri: string = process.env.DATABASE_DEV;

export const mongoBegin = async (callback: () => any) => {
  mongoose.connect(
    db_uri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err: any) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Connected to DB");
        callback();
      }
    }
  );
};

export const findOrCreateUser = async (userID: string) => {
  try {
    const usr = await User.findOne({ userID: userID });
    if (usr) {
      console.log("User already exists.");
      return usr;
    } else {
      console.log("New user needs to be created");
      return User.create({ userID: userID, rooms: Array<string>() });
    }
  } catch (err) {
    console.error(err);
  }
};

export const createNewRoom = async () => {
  try {
    return Room.create(new Room());
  } catch (err) {
    console.log(err);
  }
};

export interface IUser extends mongoose.Document {
  userID: string;
  rooms: Array<string>;
}

export interface IMessage extends mongoose.Document {
  from: string;
  to: string;
  msg: string;
  type: string;
}

export interface IRoom extends mongoose.Document {
  roomID: string;
  history: Array<IMessage>;
  playerWhite: string;
  playerBlack: string;
  currentGameStateFEN: string;
}

export const UserSchema = new mongoose.Schema({
  userID: { type: String, unique: true, required: true },
  rooms: { type: [String], default: Array<String>() },
});

export const MessageSchema = new mongoose.Schema({
  from: String,
  to: String,
  msg: String,
  type: String,
});

const defaultMessage = {
  from: "",
  to: "",
  msg: board_default.toString(),
  type: "board",
};

export const RoomSchema = new mongoose.Schema({
  roomID: { type: String, default: () => nanoid(10), unique: true },
  history: { type: [MessageSchema], default: [defaultMessage] },
  playerWhite: { type: String, default: "" },
  playerBlack: { type: String, default: "" },
  currentGameStateFEN: { type: String, default: newGameFEN },
});

export const User = mongoose.model<IUser>("User", UserSchema);
export const Message = mongoose.model<IMessage>("Message", MessageSchema);
export const Room = mongoose.model<IRoom>("Room", RoomSchema);
