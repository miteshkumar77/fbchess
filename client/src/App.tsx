import React, { Component } from "react";
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { auth } from "./services/firebase";
import { Store } from "./components/message_reducer";

interface routeHandler {
  component: React.ElementType;
  authenticated: boolean;
  restdata?: { [x: string]: any };
  path: string;
}

const PrivateRoute: React.FC<routeHandler> = ({
  component: Component,
  authenticated,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated === true ? (
          <Store>
            <Component {...props} />
          </Store>
        ) : (
          <Redirect
            to={{ pathname: "/login", state: { from: props.location } }}
          />
        )
      }
    />
  );
};

const PublicRoute: React.FC<routeHandler> = ({
  component: Component,
  authenticated,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated === false ? (
          <Component {...props} />
        ) : (
          <Redirect to="/chat" />
        )
      }
    />
  );
};

type State = {
  authenticated: boolean;
  loading: boolean;
};

type Props = {};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      authenticated: false,
      loading: true,
    };
  }

  componentDidMount() {
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authenticated: true,
          loading: false,
        });
      } else {
        this.setState({
          authenticated: false,
          loading: false,
        });
      }
    });
  }
  render() {
    console.log(this.state.authenticated);
    return this.state.loading === true ? (
      <h2>Loading...</h2>
    ) : (
      <Router>
        <Switch>
          <Route exact path="/" component={Home}></Route>

          <PrivateRoute
            path="/chat"
            authenticated={this.state.authenticated}
            component={Chat}></PrivateRoute>
          <PublicRoute
            path="/signup"
            authenticated={this.state.authenticated}
            component={Signup}></PublicRoute>
          <PublicRoute
            path="/login"
            authenticated={this.state.authenticated}
            component={Login}></PublicRoute>
        </Switch>
      </Router>
    );
  }
}

export default App;
