import React, { Component } from "react";
import { LogoutButton } from "../components/navigation";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { getCurrentUser } from "../helpers/auth";
import { BoardSVG } from "../components/svggen";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { CTX } from "../components/message_reducer";
import { msg, rooms, actionType } from "../components/message_reducer";
import PrivateHeader from "../components/privateHeader";
const useStyles = makeStyles((theme) => ({
  flexh: {
    display: "flex",
  },
  root: {
    padding: theme.spacing(3, 2),
    marginLeft: "10vw",
    marginRight: "10vw",
    marginTop: "10px",
    marginBottom: "10px",
  },
  flexv: {
    display: "flex",
    flexDirection: "column",
  },
  chat_history: {
    overflow: "scroll",
    maxHeight: "70vh",
    minHeight: "70vh",
    minWidth: "40vw",
    maxWidth: "40vw",
  },
  chat_list: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "20vw",
    maxHeight: "30vw",
    minHeight: "30vw",
    overflow: "scroll",
  },
  chat_terminal: {},
  invite: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
  },
  leaving_message: {
    margin: "10px",
    marginLeft: "20px",
    marginRight: "20px",
    textAlign: "right",
    background: "white",
  },
  arriving_message: {
    margin: "10px",
    marginLeft: "20px",
    marginRight: "20px",
    textAlign: "left",
    background: "#90caf9",
  },
  system_message: {
    margin: "10px",
    textAlign: "center",
    background: "#bdbdbd",
  },
  chat_text: {
    margin: "10px",
  },
  existing_chat_button: {
    border: "1px solid grey",
  },
}));

// const messageHist = [
//   {
//     from: "miteshkumarca@gmail.com",
//     to: "usr1x5b",
//     type: "msg",
//     msg: "Hi there.",
//   },
//   {
//     from: "usr1x5b",
//     to: "miteshkumarca@gmail.com",
//     type: "msg",
//     msg: "SUP.",
//   },
//   {
//     from: "miteshkumarca@gmail.com",
//     to: "usr1x5b",
//     type: "msg",
//     msg: "Hi there.",
//   },
//   {
//     from: "usr1x5b",
//     to: "miteshkumarca@gmail.com",
//     type: "msg",
//     msg: "SUP.",
//   },
//   {
//     from: "miteshkumarca@gmail.com",
//     to: "usr1x5b",
//     type: "msg",
//     msg:
//       "Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.Hi there.",
//   },
//   {
//     from: "usr1x5b",
//     to: "miteshkumarca@gmail.com",
//     type: "msg",
//     msg: "SUP.",
//   },
//   {
//     from: "SYSTEM",
//     to: "miteshkumarca@gmail.com",
//     type: "board",
//     msg: board_default.toString(),
//   },
// ];

export default function Chat() {
  const classes = useStyles();
  const email = getCurrentUser()?.email;
  const useCTX = React.useContext(CTX);
  const allRooms = useCTX.state;

  const dispatch = useCTX.disp;

  const default_room = () => {
    const okeys = Object.keys(allRooms);
    if (okeys.length == 0) {
      return null;
    } else {
      return okeys[0];
    }
  };

  const [activeRoomID, changeActiveRoom] = React.useState(default_room());
  const [textValue, changeTextValue] = React.useState("");

  return (
    <div>
      <PrivateHeader />
      <Paper className={classes.root}>
        <div className={classes.flexh}>
          <div className={classes.flexv}>
            <div className={classes.chat_list}>
              {Object.keys(allRooms).length != 0 ? (
                Object.keys(allRooms).map((roomID, idx) => {
                  const room = allRooms[roomID];

                  return (
                    <Button
                      className={classes.existing_chat_button}
                      key={idx}
                      value={roomID}
                      onClick={(e) => {
                        changeActiveRoom(e.currentTarget.value);
                      }}>
                      <Typography variant="h6">
                        {room.playerBlack + " and " + room.playerWhite}
                      </Typography>
                    </Button>
                  );
                })
              ) : (
                <Button>
                  <Typography variant="h6">No games. Start one!</Typography>
                </Button>
              )}
            </div>
            <div className={classes.invite}>
              <Button variant="contained" fullWidth={false} color="secondary">
                New
              </Button>

              <Button variant="contained" color="primary">
                Join
              </Button>
              <TextField
                id="standard-search"
                label="Enter a room ID"
                type="search"
                fullWidth={true}
              />
            </div>
          </div>
          <div className={classes.flexv}>
            <div className={classes.chat_history}>
              {activeRoomID ? (
                allRooms[activeRoomID].history.map((entry, idx) => {
                  let from = entry.from;
                  let type = entry.type;
                  let msg = entry.msg;
                  if (type == "msg") {
                    if (from == email) {
                      return (
                        <Paper key={idx} className={classes.leaving_message}>
                          <Typography
                            variant="h4"
                            className={classes.chat_text}>
                            :You
                          </Typography>
                          <Typography
                            variant="h6"
                            className={classes.chat_text}>
                            {msg}
                          </Typography>
                        </Paper>
                      );
                    } else {
                      return (
                        <Paper key={idx} className={classes.arriving_message}>
                          <Typography
                            variant="h4"
                            className={classes.chat_text}>
                            {from}:
                          </Typography>
                          <Typography
                            variant="h6"
                            className={classes.chat_text}>
                            {msg}
                          </Typography>
                        </Paper>
                      );
                    }
                  } else if (type == "board") {
                    return (
                      <Paper key={idx} className={classes.system_message}>
                        <Typography variant="h4">system</Typography>
                        <BoardSVG
                          player={
                            allRooms[activeRoomID].playerWhite == email
                              ? "W"
                              : "B"
                          }
                          data={msg.split(",")}
                        />
                      </Paper>
                    );
                  }
                })
              ) : (
                <Paper className={classes.arriving_message}>
                  <Typography variant="h4" className={classes.chat_text}>
                    No group exists. Add one!
                  </Typography>
                </Paper>
              )}
            </div>
            <div className={classes.chat_terminal}>
              <div className={classes.flexh}>
                <TextField
                  id="standard-search"
                  label="Enter a message"
                  type="search"
                  value={textValue}
                  onChange={(e) => changeTextValue(e.target.value)}
                  fullWidth={true}
                />
                <Button
                  onClick={() => {
                    if (activeRoomID && email && textValue != "") {
                      const send_val: msg = {
                        from: email,
                        to:
                          allRooms[activeRoomID].playerBlack == email
                            ? allRooms[activeRoomID].playerWhite
                            : allRooms[activeRoomID].playerBlack,
                        type: "msg",
                        msg: textValue,
                      };

                      const action: actionType = {
                        type: "SEND_MESSAGE",
                        payload: {
                          msg: send_val,
                          roomID: activeRoomID,
                        },
                      };
                      dispatch(action);
                      changeTextValue("");
                    }
                  }}>
                  SEND
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
}
