const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MsgSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  type: { type: String, required: true },
  msg: { type: String, required: true },
});

const RoomSchema = new Schema({
  _id: { type: String },
  playerBlack: { type: String, required: false },
  playerWhite: { type: String, required: false },
  history: { type: [MsgSchema] },
});

const UserSchema = new Schema({
  _id: { type: String },
  rooms: { type: [String] },
});

UserSchema.virtual("email").get(function () {
  return this._id;
});

exports.RoomSchema = RoomSchema;
exports.UserSchema = UserSchema;
exports.MsgSchema = MsgSchema;
