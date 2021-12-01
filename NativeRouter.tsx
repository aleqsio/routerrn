import { atom, useAtom } from "jotai";
import React, { memo, useMemo, useState } from "react";

import {
  Button,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ScreenStack,
  Screen,
  ScreenStackHeaderConfig,
} from "react-native-screens";
import useCheckbox from "./useCheckbox";

export const historyAtom = atom<string[]>([]); // last visited url is last element
export const urlAtom = atom(
  (get) => get(historyAtom)[get(historyAtom).length - 1],
  (get, set, url: string) => {
    set(historyAtom, [...get(historyAtom), url]);
  }
);
export const viewsAtom = atom<{ [key: string]: JSX.Element }>({});

const NativeRouter: any = ({ children }) => {
  const [url, setUrl] = useAtom(urlAtom);
  const [views, setViews] = useAtom(viewsAtom);
  const [history, setHistory] = useAtom(historyAtom);
  const screens = [
    ...new Set(history.filter((url) => views[url]).reverse()),
  ].reverse();
  const [shouldPopExistingScreens, popCheckbox] = useCheckbox(
    "shouldPopExisting",
    true
  );

  // should entering exisitng url go back in history
  const navigate = (url: string) => {
    if (!views[url]) return;
    if (!shouldPopExistingScreens) {
      setUrl(url);
      return;
    }
    if (history.find((h) => h === url)) {
      setHistory((h) => [...h.slice(0, h.indexOf(url)), url]);
    } else {
      setUrl(url);
    }
  };
  console.log({ screens });

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View
        style={{
          marginTop: 30,
        }}
      >
        <Text style={{ fontSize: 20 }}>{url}</Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {Object.keys(views).map((v) => (
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => navigate(v)}
            >
              <Text>{v}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => {
              setHistory((h) => h.slice(0, -1));
            }}
          >
            <Text>UNDO</Text>
          </TouchableOpacity>
        </View>

        {popCheckbox}
      </View>
      <ScreenStack style={{ flex: 1 }}>
        {screens.map((currUrl, idx) => (
          <Screen
            key={`${currUrl}-${idx}`}
            onWillDisappear={() => {
              if (url === currUrl) {
                setHistory((h) => h.slice(0, -1));
              }
            }}
            style={{ flex: 1, backgroundColor: "red", padding: 50 }}
          >
            <ScreenStackHeaderConfig
              title={currUrl}
              backTitle={screens[idx - 1]}
            />
            {views[currUrl]}
          </Screen>
        ))}
      </ScreenStack>
      <View style={{ flex: 1, display: "none" }}>{children}</View>
    </View>
  );
};
export default NativeRouter;
