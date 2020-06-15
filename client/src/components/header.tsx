import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { LoginButton, SignupButton } from "../components/navigation";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: "2px",
    paddingRight: "2px",
    flexGrow: 1,
  },
  right: {
    marginLeft: "auto",
  },
  title: {},
  button: {},
}));

export default function Header() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography className={classes.title} variant="h6">
            Chess App
          </Typography>
          <div className={classes.right}>
            <LoginButton />

            <SignupButton />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
