import React from "react";
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { logout } from "../helpers/auth";

export function LoginButton() {
  let history = useHistory();

  function handleClick() {
    history.push("/login");
  }

  return (
    <Button
      color="inherit"
      variant="outlined"
      style={{ margin: "5px" }}
      onClick={handleClick}>
      Login
    </Button>
  );
}

export function SignupButton() {
  let history = useHistory();

  function handleClick() {
    history.push("/signup");
  }

  return (
    <Button color="inherit" variant="outlined" onClick={handleClick}>
      Sign Up
    </Button>
  );
}

export function LogoutButton() {
  let history = useHistory();

  function handleClick() {
    history.push("/");
    logout();
  }

  return (
    <Button color="inherit" variant="outlined" onClick={handleClick}>
      Log Out
    </Button>
  );
}
