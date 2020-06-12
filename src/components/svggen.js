import React, { Component } from "react";
import { makeStyles, rgbToHex } from "@material-ui/core/styles";
import blackPawn from "../pieces/black-pawn.png";
import blackBishop from "../pieces/black-bishop.png";
import blackRook from "../pieces/black-rook.png";
import blackKnight from "../pieces/black-knight.png";
import blackQueen from "../pieces/black-queen.png";
import blackKing from "../pieces/black-king.png";
import whitePawn from "../pieces/white-pawn.png";
import whiteBishop from "../pieces/white-bishop.png";
import whiteQueen from "../pieces/white-queen.png";
import whiteRook from "../pieces/white-rook.png";
import whiteKnight from "../pieces/white-knight.png";
import whiteKing from "../pieces/white-king.png";

const useStyles = makeStyles((theme) => ({
  square: {
    border: "1px solid",
    float: "left",
    fontSize: "24px",
    fontWeight: "bold",
    lineHeight: "34px",
    height: "48px",
    marginRight: "-1px",
    marginTop: "-1px",
    padding: "0",
    textAlign: "center",
    width: "48px",
  },
  shaded_square: {
    backgroundColor: "#bbbe64",
  },
  unshaded_square: {
    backgroundColor: "#eaf0ce",
  },
  row: {
    clear: "both",
    content: "",
    display: "table",
  },
}));

const eight_arr = [0, 1, 2, 3, 4, 5, 6, 7];
const piece_map = {
  "22": blackPawn,
  "21": blackBishop,
  "20": blackRook,
  "19": blackKnight,
  "18": blackQueen,
  "17": blackKing,
  "16": whitePawn,
  "15": whiteBishop,
  "14": whiteRook,
  "13": whiteKnight,
  "12": whiteQueen,
  "11": whiteKing,
};

const board_map = {
  W: "chessboard",
  B: "chessboard-reverse",
};

function Square(props) {
  const classes = useStyles();
  return (
    <button
      className={`${
        props.shaded ? classes.shaded_square : classes.unshaded_square
      }, ${classes.square}`}>
      <img src={piece_map[props.piece]} />
    </button>
  );
}

export default function BoardSVG({ player: player, data: data }) {
  const classes = useStyles();
  if (player === "W") {
    let k = -1;
    let shade = true;
    return eight_arr.map((i) => {
      return (
        <div className={classes.row} key={i}>
          {eight_arr.map((j) => {
            k += 1;
            shade = !shade;
            return <Square key={k} shaded={shade} piece={data[k]} />;
          })}
        </div>
      );
    });
  } else {
    let k = 64;
    let shade = false;
    return eight_arr.map((i) => {
      return (
        <div className={classes.row} key={i}>
          {eight_arr.map((j) => {
            k -= 1;
            shade = !shade;
            return <Square key={k} shaded={shade} piece={data[k]} />;
          })}
        </div>
      );
    });
  }
}
