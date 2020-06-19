import React from "react";
import { board_default } from "../components/board_formulas";
import { getCurrentUser } from "../helpers/auth";
import io from "socket.io-client";

export interface msg {
  from: string;
  to: string;
  type: string;
  msg: string;
}

export interface rooms {
  [roomID: string]: {
    playerBlack: string;
    playerWhite: string;
    history: Array<msg>;
  };
}

export interface actionType {
  type: string;
  payload: {
    roomID: string;
    msg: msg;
  };
}

export interface initializeType {
  type: "INIT_CTX";
  payload: {
    roomID: string;
    msg: msg;
    loadRooms: rooms;
  };
}

const initState: rooms = {
  room1: {
    playerBlack: "friend",
    playerWhite: "miteshkumarca@gmail.com",
    history: [
      {
        from: "friend",
        to: "miteshkumarca@gmail.com",
        type: "msg",
        msg: "gm",
      },
      {
        from: "friend",
        to: "miteshkumarca@gmail.com",
        type: "msg",
        msg: "gm",
      },
      {
        from: "miteshkumarca@gmail.com",
        to: "friend",
        type: "msg",
        msg: "hi",
      },
      {
        from: "system",
        to: "friend",
        type: "board",
        msg: board_default.toString(),
      },
    ],
  },
  room2: {
    playerWhite: "friend",
    playerBlack: "miteshkumarca@gmail.com",
    history: [
      {
        from: "friend",
        to: "miteshkumarca@gmail.com",
        type: "msg",
        msg: "gm",
      },
      {
        from: "friend",
        to: "miteshkumarca@gmail.com",
        type: "msg",
        msg: "gm",
      },
      {
        from: "miteshkumarca@gmail.com",
        to: "friend",
        type: "msg",
        msg: "hi",
      },
    ],
  },
};

interface IContextProps {
  state: rooms;
  disp: React.Dispatch<actionType>;
}

const CTX = React.createContext({} as IContextProps);

function reducer(state: rooms, action: actionType | initializeType) {
  const msg = action.payload.msg;
  switch (action.type) {
    case "RECEIVE_MESSAGE":
      return {
        ...state,
        [action.payload.roomID]: {
          playerWhite: state[action.payload.roomID].playerWhite,
          playerBlack: state[action.payload.roomID].playerBlack,
          history: [...state[action.payload.roomID].history, msg],
        },
      };

    case "SEND_MESSAGE":
      console.log("MSG SEND");
      return state;
    case "LEAVE_CURRENT_ROOM":
      console.log("LEAVE_CURRENT_ROOM");
      return state;
    case "JOIN_EXISTING_ROOM":
      return state;
    case "NEW_ROOM":
      console.log("NEW_ROOM");
      return state;
    case "INIT_CTX":
      console.log("INIT_CTX");
      return (action as initializeType).payload.loadRooms;
    default:
      return state;
  }
}

let socket: SocketIOClient.Socket;

export function Store(props: any) {
  const email = getCurrentUser()?.email;

  let loadedinitstate: rooms = {};

  const [rooms, dispatch] = React.useReducer(reducer, loadedinitstate);

  React.useEffect(() => {
    const ENDPOINT = "http://localhost:4000";
    socket = io(ENDPOINT);
    socket.emit(
      "initialize",
      email,
      (response: { hist: rooms; error: string }) => {
        if (response.error) {
          alert(response.error);
        } else {
          const action: initializeType = {
            type: "INIT_CTX",
            payload: {
              loadRooms: response.hist,
              msg: {
                from: "",
                to: "",
                msg: "",
                type: "",
              },
              roomID: "",
            },
          };
          dispatch(action);
        }
      }
    );

    return () => {
      socket.emit("deinitialize", email, () => {
        socket.close();
      });
    };
  }, []);

  const contextProp: IContextProps = {
    state: rooms,
    disp: dispatch,
  };
  return <CTX.Provider value={contextProp}>{props.children}</CTX.Provider>;
}

export { CTX };
