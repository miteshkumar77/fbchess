import { Chess, ChessInstance } from "chess.js";
import { msgType } from "./crud";
const piece_map: { [piece: string]: string } = {
  bp: "22",
  bb: "21",
  br: "20",
  bn: "19",
  bq: "18",
  bk: "17",
  wp: "16",
  wb: "15",
  wr: "14",
  wn: "13",
  wq: "12",
  wk: "11",
};

const getGameArray = (chessGame: ChessInstance) => {
  const result = Array<string>(64);
  const bd = chessGame.board();
  bd.forEach((bdRow, i) => {
    bdRow.forEach((pos, j) => {
      if (pos) {
        result[63 - 8 * i - j] = piece_map[pos.color + pos.type];
      } else {
        result[63 - 8 * i - j] = "";
      }
    });
  });
  return result;
};

const playerMap: { [name: string]: string } = {
  playerBlack: "b",
  playerWhite: "w",
};
export const getGameCmd = (
  chessGame: ChessInstance,
  player: string,
  playerBlack: string,
  playerWhite: string,
  move: string
) => {
  const playerColor = player == playerBlack ? "b" : "w";
  const result: msgType = {
    from: "",
    to: "",
    msg: "",
    type: "",
  };

  console.log("|" + move + "|");
  if (playerBlack === "" || playerWhite === "") {
    result.type = "system_msg";
    result.msg = "Game needs two players to proceed.";
  } else if (chessGame.turn() !== playerColor) {
    result.type = "system_msg";
    result.msg = `It is not your turn ${player}.`;
  } else if (chessGame.game_over()) {
    result.type = "system_msg";
    result.msg = `The game is already over.`;
  } else if (!chessGame.move(move.trim(), { sloppy: true })) {
    console.log(chessGame.moves());
    result.type = "system_msg";
    result.msg = `Invalid move from ${player}`;
  } else {
    result.type = "board";
    result.msg = getGameArray(chessGame).toString();
  }
  return result;
};

// const board_default: Array<string> = [
//   "14",
//   "13",
//   "15",
//   "11",
//   "12",
//   "15",
//   "13",
//   "14",
//   "16",
//   "16",
//   "16",
//   "16",
//   "16",
//   "16",
//   "16",
//   "16",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "",
//   "22",
//   "22",
//   "22",
//   "22",
//   "22",
//   "22",
//   "22",
//   "22",
//   "20",
//   "19",
//   "21",
//   "17",
//   "18",
//   "21",
//   "19",
//   "20",
// ];

// function arraysEqual<T>(a: Array<T>, b: Array<T>) {
//   if (a === b) return true;
//   if (a == null || b == null) return false;
//   if (a.length !== b.length) return false;

//   // If you don't care about the order of the elements inside
//   // the array, you should sort both arrays here.
//   // Please note that calling sort on an array will modify that array.
//   // you might want to clone your array first.

//   for (var i = 0; i < a.length; ++i) {
//     console.log(`${i}: ${a[i]} === ${b[i]}`);
//   }
//   return true;
// }

// console.log(arraysEqual(getGameArray(new Chess()), board_default));

// console.log(getGameArray(new Chess()));
