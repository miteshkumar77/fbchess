import React, { Component } from "react";
import { signup } from "../helpers/auth";
import Form from "../components/form";
class Signup extends Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Signup.</h1>
        <h1>H</h1>
        <Form onSubmit={signup} />
      </div>
    );
  }
}

export default Signup;
