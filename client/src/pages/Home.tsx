import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Paper from "@material-ui/core/Paper";
import { LoginButton, SignupButton } from "../components/navigation";
import { makeStyles } from "@material-ui/core/styles";
import { BoardSVG } from "../components/svggen";
import { board_default } from "../components/board_formulas";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: "50px",
  },
  button: {
    margin: "30px",
  },
  flex: {
    flex: "true",
    textAlign: "center",
  },
  gridc: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridGap: "20px",
  },
}));

function Home() {
  const classes = useStyles();

  return (
    <div>
      <Header />
      <div />
      <div>
        <Paper elevation={7} className={classes.root}>
          <div className={classes.flex}>
            <LoginButton />
            <SignupButton />
          </div>
          <div style={{ marginLeft: "15%", textAlign: "center" }}>
            <div className={classes.gridc}>
              <BoardSVG data={board_default} player={"B"} />
              <BoardSVG data={board_default} player={"W"} />
            </div>
          </div>
        </Paper>
      </div>
      <div className={classes.flex}>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
