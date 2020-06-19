import * as dotenv from "dotenv";
dotenv.config();
const db_connection_string = process.env.DATABASE;
const PORT: string | number = process.env.PORT || 3009;

import express from "express";
import socketio from "socket.io";
import http from "http";
import router from "./router";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

io.on("connection", (socket) => {
  console.log("A user connected.");

  socket.on("disconnect", () => {
    console.log("A user left.");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
