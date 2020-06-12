import React, { Component } from "react";
import Header from "../components/header";
import { BoardSVG } from "../components/svggen";

class Home extends Component {
  render() {
    let data = Array(64);
    data.fill("11");
    return (
      <div className="home">
        <Header />
        <BoardSVG data={data} player={"W"} />
      </div>
    );
  }
}

export default Home;
