import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Outlet, Route } from "react-router";
import { Link } from "./Link";
import NativeRouter from "./NativeRouter";
import Routes from "./Routes";
import { run } from "./historyTest";
export default function App() {
  // run();
  // return null;
  return (
    <View style={styles.container}>
      <NativeRouter>
        <Routes tag="root">
          <Route
            path="/"
            screen
            element={
              <Text style={{ padding: 30 }}>
                Index
                <Link to="/friends/bestfriend">Friends</Link>
                <Outlet />
              </Text>
            }
          ></Route>
          <Route
            path="friends/*"
            screen
            element={
              <Routes tag="nested">
                <Route
                  screen
                  index
                  element={
                    <Text style={{ padding: 50 }}>
                      List of friends
                      <Link to="/friends/friendsstuff">Friends</Link>
                      {/* <Outlet /> */}
                    </Text>
                  }
                ></Route>
                <Route
                  screen
                  path="friendsstuff"
                  element={
                    <Text style={{ padding: 50 }}>
                      Nested
                      <Link to="/">Friends</Link>
                      {/* <Outlet /> */}
                    </Text>
                  }
                ></Route>
              </Routes>
            }
          ></Route>
          <Route
            screen
            path="mates"
            element={
              <>
                <Text style={{ padding: 30 }}>List of mates</Text>
                <Link to="/mates/bestmate">goto bestmate</Link>
                <Link to="/friends">goto friends</Link>
                {/* <Link to="/friends/friendsstuff">goto friendsstuff</Link> */}
              </>
            }
          >
            <Route
              screen
              path="bestmate"
              element={
                <>
                  <Text>bestmate</Text>
                  <Link to="/mates/othermates">goto othermates2</Link>
                </>
              }
            ></Route>
            <Route
              screen
              path="othermates"
              element={<Text>othermates</Text>}
            ></Route>
          </Route>
        </Routes>
      </NativeRouter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
