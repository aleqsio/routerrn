import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import NativeRouter from "./NativeRouter";
import Route from "./Route";
import Routes from "./Routes";
export default function App() {
  return (
    <View style={styles.container}>
      <NativeRouter>
        <Routes>
          {/* <Route path="/" element={<Text>App</Text>}></Route> */}
          <Route path="friends" element={<Text>List of friends</Text>}>
            <Route path="bestfriend" element={<Text>bestfriend</Text>}></Route>
            <Route path="other" element={<Text>bestfriend</Text>}></Route>
          </Route>
          <Route path="mates" element={<Text>List of mates</Text>}>
            <Route path="bestmate" element={<Text>bestmate</Text>}></Route>
            <Route path="othermates" element={<Text>othermates</Text>}></Route>
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
