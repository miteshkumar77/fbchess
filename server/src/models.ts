import { prop, getModelForClass } from "@typegoose/typegoose";
import * as mongoose from "mongoose";
import { nanoid } from "nanoid";

export class User {
  @prop({ unique: true, required: true })
  public userID!: string;
  @prop()
  public rooms!: Array<string>;
}

export class Message {
  @prop({ required: true })
  public from!: string;
  @prop({ required: true })
  public to!: string;
  @prop({ required: true })
  public msg!: string;
  @prop({ required: true })
  public type!: string;
}

export class Room {
  @prop({ unique: true, default: () => nanoid(10) })
  public roomID!: string;
  @prop({ required: false })
  public playerBlack!: string;
  @prop({ required: false })
  public playerWhite!: string;
  @prop({ required: true })
  public currentGameStateFEN!: string;
  @prop({ required: true, default: Array<Message>() })
  public history!: Array<Message>;
}

export const userModel = getModelForClass(User);
export const messageModel = getModelForClass(Message);
export const roomModel = getModelForClass(Room);
