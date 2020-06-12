import React, { Component } from "react";
import Header from "../components/header";
class Home extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="home">
        <Header />
      </div>
    );
  }
}

export default Home;
