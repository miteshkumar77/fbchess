import React from "react";

interface msg {
  from: string;
  to: string;
  type: string;
  msg: string;
}

interface rooms {
  [roomID: string]: {
    playerBlack: string;
    playerWhite: string;
    history: Array<msg>;
  };
}

interface actionType {
  type: string;
  payload: {
    roomID: string;
    msg: msg;
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
        msg: "kys",
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

function reducer(state: rooms, action: actionType) {
  const msg = action.payload.msg;
  switch (action.type) {
    case "RECEIVE_MESSAGE":
      return {
        ...state,
        [action.payload.roomID]: {
          playerWhite: state[action.payload.roomID].playerWhite,
          playerBlack: state[action.payload.roomID].playerBlack,
          history: {
            ...state[action.payload.roomID].history,
            msg,
          },
        },
      };
    default:
      return state;
  }
}

export function Store(props: any) {
  const [rooms, dispatch] = React.useReducer(reducer, initState);
  const contextProp: IContextProps = {
    state: rooms,
    disp: dispatch,
  };
  return <CTX.Provider value={contextProp}>{props.children}</CTX.Provider>;
}

export { CTX };
