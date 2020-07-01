import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => {});

export default function Footer() {
  return (
    <footer className="pt-5">
      <div className="container text-center">
        <p>&copy; FB Chess 2020.</p>
      </div>
    </footer>
  );
}
