import React, { Component } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { auth } from "../services/firebase";
import { LoginButton, SignupButton } from "../components/navigation";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: "50px",
  },
  button: {},
  flex: {
    flex: "true",
    textAlign: "center",
    alignContent: "center",
  },
}));

function Home() {
  const classes = useStyles();

  return (
    <div>
      <Header />
      <div />
      <div>
        <Paper className={classes.root}>
          <div className={classes.flex}>
            <LoginButton />
            <SignupButton />
          </div>
        </Paper>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
