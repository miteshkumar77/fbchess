import react, { Compontent } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

piece_map = {
  "22": "black-pawn",
  "21": "black-bishop",
  "20": "black-rook",
  "19": "black-knight",
  "18": "black-queen",
  "17": "black-king",
  "16": "white-pawn",
  "15": "white-bishop",
  "14": "white-rook",
  "13": "white-knight",
  "12": "white-queen",
  "11": "white-king",
};

board_map = {
  W: "chessboard",
  B: "chessboard-reverse",
};

function Square(props) {
  const classes = useStyles();
  return (
    <button
      className={
        props.shaded ? classes.shaded_square : classes.unshaded_square
      }>
      piece={props.piece}
    </button>
  );
}

export default class BoardSVG extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      player: props.player,
    };
  }
}
