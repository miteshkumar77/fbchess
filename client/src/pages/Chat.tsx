import React, { useReducer } from "react";
import { LogoutButton } from "../components/navigation";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { getCurrentUser } from "../helpers/auth";
import { board_default } from "../components/board_formulas";
import { BoardSVG } from "../components/svggen";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

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
  },
  chat_list: {
    maxWidth: "30vw",
    minWidth: "30vw",
  },
  chat_terminal: {
    minWidth: "30vw",
    minHeight: "10vh",
    maxHeight: "10vh",
  },
  invite: {},
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
    marginLeft: "20px",
    marginRight: "20px",
    textAlign: "center",
    background: "#bdbdbd",
  },
  chat_text: {
    margin: "10px",
  },
}));

interface msg {
  from: string;
  to: string;
  type: string;
  msg: string;
}

const messageHist = [
  {
    from: "miteshkumarca@gmail.com",
    to: "usr1x5b",
    type: "msg",
    msg: "Hi there.",
  },
  {
    from: "usr1x5b",
    to: "miteshkumarca@gmail.com",
    type: "msg",
    msg: "SUP.",
  },
  {
    from: "SYSTEM",
    to: "miteshkumarca@gmail.com",
    type: "board",
    msg: board_default.toString(),
  },
];
const messageHist2 = [
  {
    from: "miteshkumarca@gmail.com",
    to: "usr1x5b",
    type: "msg",
    msg: "Hi there.",
  },
  {
    from: "usr1x5b",
    to: "miteshkumarca@gmail.com",
    type: "msg",
    msg: "SUP.",
  },
  {
    from: "SYSTEM",
    to: "miteshkumarca@gmail.com",
    type: "board",
    msg: board_default.toString(),
  },
];
const messageHist3 = [
  {
    from: "miteshkumarca@gmail.com",
    to: "usr1x5b",
    type: "msg",
    msg: "Hi there.",
  },
  {
    from: "usr1x5b",
    to: "miteshkumarca@gmail.com",
    type: "msg",
    msg: "SUP.",
  },
  {
    from: "SYSTEM",
    to: "miteshkumarca@gmail.com",
    type: "board",
    msg: board_default.toString(),
  },
];

const chatRooms = [messageHist, messageHist2, messageHist3];

export default function Chat() {
  const classes = useStyles();
  const usr = getCurrentUser();
  const email = usr?.email;
  const player_color = "B";

  return (
    <div>
      <Paper className={classes.root}>
        <div className={classes.flexh}>
          <div className={classes.flexv}>
            <div className={classes.chat_list}>
              <Typography variant="h3">
                {email} chat lists show here.
              </Typography>
            </div>
            <div className={classes.invite}>
              <Typography variant="h3">Invite button here.</Typography>
            </div>
          </div>
          <div className={classes.flexv}>
            <div className={classes.chat_history}>
              {messageHist.map((entry, idx) => {
                let from = entry.from;
                let type = entry.type;
                let msg = entry.msg;
                if (type == "msg") {
                  if (from == email) {
                    return (
                      <Paper key={idx} className={classes.leaving_message}>
                        <Typography variant="h4" className={classes.chat_text}>
                          :You
                        </Typography>
                        <Typography variant="h6" className={classes.chat_text}>
                          {msg}
                        </Typography>
                      </Paper>
                    );
                  } else {
                    return (
                      <Paper key={idx} className={classes.arriving_message}>
                        <Typography variant="h4" className={classes.chat_text}>
                          {from}:
                        </Typography>
                        <Typography variant="h6" className={classes.chat_text}>
                          {msg}
                        </Typography>
                      </Paper>
                    );
                  }
                } else if (type == "board") {
                  return (
                    <Paper key={idx} className={classes.system_message}>
                      <Typography variant="h4">system</Typography>
                      <BoardSVG player={player_color} data={msg.split(",")} />
                    </Paper>
                  );
                }
              })}
            </div>
            <div className={classes.chat_terminal}>
              <div className={classes.flexh}>
                <TextField
                  id="standard-search"
                  label="Enter Move"
                  type="search"
                  fullWidth={true}
                />
                <Button>SEND</Button>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
}
