import React, { Component } from "react";
import { LogoutButton } from "../components/navigation";
class Chat extends Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Chat.</h1>
        <LogoutButton />
      </div>
    );
  }
}

export default Chat;
