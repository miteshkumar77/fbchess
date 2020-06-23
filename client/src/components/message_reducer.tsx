import React from "react";
import io from "socket.io-client";
import { getCurrentUser } from "../helpers/auth";
let email: string | null | undefined;

export interface msg {
  from: string;
  to: string;
  type: string;
  msg: string;
}

export interface roomType {
  playerBlack: string;
  playerWhite: string;
  history: Array<msg>;
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

let socket: SocketIOClient.Socket;
// const initState: rooms = {
//   room1: {
//     playerBlack: "friend",
//     playerWhite: "miteshkumarca@gmail.com",
//     history: [
//       {
//         from: "friend",
//         to: "miteshkumarca@gmail.com",
//         type: "msg",
//         msg: "gm",
//       },
//       {
//         from: "friend",
//         to: "miteshkumarca@gmail.com",
//         type: "msg",
//         msg: "gm",
//       },
//       {
//         from: "miteshkumarca@gmail.com",
//         to: "friend",
//         type: "msg",
//         msg: "hi",
//       },
//       {
//         from: "system",
//         to: "friend",
//         type: "board",
//         msg: board_default.toString(),
//       },
//     ],
//   },
//   room2: {
//     playerWhite: "friend",
//     playerBlack: "miteshkumarca@gmail.com",
//     history: [
//       {
//         from: "friend",
//         to: "miteshkumarca@gmail.com",
//         type: "msg",
//         msg: "gm",
//       },
//       {
//         from: "friend",
//         to: "miteshkumarca@gmail.com",
//         type: "msg",
//         msg: "gm",
//       },
//       {
//         from: "miteshkumarca@gmail.com",
//         to: "friend",
//         type: "msg",
//         msg: "hi",
//       },
//     ],
//   },
// };

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
      socket.emit("outbound_message", action.payload.roomID, msg);
      return state;
    case "LEAVE_CURRENT_ROOM":
      console.log("LEAVE_CURRENT_ROOM");
      return state;
    case "JOIN_EXISTING_ROOM":
      socket.emit(
        "join_room",
        email,
        action.payload.roomID,
        ({ error }: { error: string }) => {
          if (error) {
            alert(error);
          }
        }
      );
      return state;
    case "NEW_ROOM":
      console.log("NEW ROOM");
      socket.emit("new_room", email);
      return state;
    case "INIT_CTX":
      console.log("INIT_CTX");
      return (action as initializeType).payload.loadRooms;
    default:
      return state;
  }
}

export function Store(props: any) {
  email = getCurrentUser()?.email;
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

    socket.on("message", (roomID: string, message: msg) => {
      console.log("MESSAGE RECEIVED: ");
      console.log(message);
      let action: actionType = {
        type: "RECEIVE_MESSAGE",
        payload: {
          msg: message,
          roomID: roomID,
        },
      };

      dispatch(action);
    });

    socket.on("incoming_room", (newRooms: rooms) => {
      console.log("ROOM ADDED: ");
      console.log(newRooms);
      let action: initializeType = {
        type: "INIT_CTX",
        payload: {
          loadRooms: newRooms,
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
    });

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
