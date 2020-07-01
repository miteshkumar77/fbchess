import React from "react";
import { makeStyles } from "@material-ui/core/styles";
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
  black_square: {
    backgroundColor: "grey",
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
  white_square: {
    backgroundColor: "white",
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

  letter_label: {
    backgroundColor: "white",
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

  number_label: {
    backgroundColor: "white",
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
  row: {
    clear: "both",
    content: "",
    display: "table",
  },
  board: {
    margin: "3px",
  },

  labelLetter: {
    fontSize: "8px",
    marginTop: "40px",
    marginLeft: "40px",
  },

  labelNumber: {
    fontSize: "8px",
    marginBottom: "40px",
    marginRight: "40px",
  },
}));

const eight_arr = [0, 1, 2, 3, 4, 5, 6, 7];
const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
interface PieceMap {
  [key: string]: string;
}
const piece_map: PieceMap = {
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

interface SquareData {
  shaded: boolean;
  piece: string;
  number?: number;
}
const Square: React.FC<SquareData> = ({ shaded, piece, number }) => {
  const classes = useStyles();
  if (number) {
    return (
      <>
        <div className={classes.number_label}>{number}</div>
        <div className={shaded ? classes.black_square : classes.white_square}>
          {piece_map[piece] ? <img src={piece_map[piece]} alt="" /> : null}
        </div>
      </>
    );
  }
  return (
    <div className={shaded ? classes.black_square : classes.white_square}>
      {piece_map[piece] ? <img src={piece_map[piece]} alt="" /> : null}
    </div>
  );
};

interface BoardData {
  player: string;
  data: Array<string>;
}

export const BoardSVG: React.FC<BoardData> = ({ player, data }) => {
  const classes = useStyles();
  if (player === "B") {
    let k = -1;
    let shade = false;
    return (
      <div className={classes.board}>
        {eight_arr.map((i) => {
          const html = (
            <div className={classes.row} key={i}>
              <text></text>
              {eight_arr.map((j) => {
                k += 1;
                shade = !shade;
                if (j === 0) {
                  return (
                    <Square
                      key={k}
                      shaded={shade}
                      piece={data[k]}
                      number={i + 1}
                    />
                  );
                } else {
                  return <Square key={k} shaded={shade} piece={data[k]} />;
                }
              })}
            </div>
          );
          shade = !shade;
          return html;
        })}
        <div className={classes.row} key={9}>
          <div className={classes.white_square}></div>

          {eight_arr.map((i) => {
            return (
              <div className={classes.letter_label}>{letters[8 - i - 1]} </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    let k = 64;
    let shade = true;
    return (
      <div className={classes.board}>
        {eight_arr.map((i) => {
          const html = (
            <div className={classes.row} key={i}>
              {eight_arr.map((j) => {
                k -= 1;
                shade = !shade;

                if (j === 0) {
                  return (
                    <Square
                      key={k}
                      shaded={shade}
                      piece={data[k]}
                      number={8 - i}
                    />
                  );
                } else {
                  return <Square key={k} shaded={shade} piece={data[k]} />;
                }
              })}
            </div>
          );
          shade = !shade;
          return html;
        })}
        <div className={classes.row} key={9}>
          <div className={classes.white_square}></div>

          {eight_arr.map((i) => {
            return <div className={classes.letter_label}>{letters[i]} </div>;
          })}
        </div>
      </div>
    );
  }
};
