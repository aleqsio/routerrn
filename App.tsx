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
        <Routes tabs>
          {/* <Route
            path="people"
            screen={
              <Text style={{ padding: 30 }}>
                Index
                <Link to="/people/bestfriend">People</Link>
                <Outlet />
              </Text>
            }
          ></Route> */}
          <Route
            path="friends/*"
            element={
              <>
                <Text>Friends screen</Text>
                <Routes tabs>
                  <Route
                    path="firsttab/testofnesting"
                    element={
                      <Text style={{ padding: 50 }}>
                        List of friends
                        <Link to="/friends/friendsstuff">Friends</Link>
                        {/* <Outlet /> */}
                      </Text>
                    }
                  ></Route>
                  <Route
                    path="secondtab"
                    element={
                      <Text style={{ padding: 50 }}>
                        Nested
                        <Link to="/">Friends</Link>
                        {/* <Outlet /> */}
                      </Text>
                    }
                  ></Route>
                </Routes>
              </>
            }
          ></Route>
          <Route
            path="mates"
            element={
              <>
                <Text>stackmates</Text>
                <Link to="/mates/bestmate">Mates</Link>
                <Routes stack>
                  <Route
                    path="bestmate"
                    element={
                      <>
                        <Text>bestmate</Text>
                        <Link to="/mates/othermates">goto othermates2</Link>
                      </>
                    }
                  ></Route>
                  <Route
                    path="othermates"
                    element={<Text>othermates</Text>}
                  ></Route>
                </Routes>
              </>
            }
          ></Route>
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
