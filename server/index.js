var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const mongoose = require("mongoose");
const config = require("./config");

const socket_runner = async () => {
  const port = process.env.PORT || config.server_port;
  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  io.on("connection", (socket) => {
    console.log("a user connected");
  });
  http.listen(port, () => {
    console.log("listening on *:" + port);
  });
};

mongoose
  .connect(config.db_connection_string, {
    useNewURLParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.log(err);
  });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to DB");
  socket_runner();
});
