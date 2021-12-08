import { atom, useAtom } from "jotai";
import React, { memo, useEffect, useMemo, useState } from "react";

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

import useNestedHistory from "./useNestedHistory";

export const historyAtom = atom<string[]>([]); // last visited url is last element
export const urlAtom = atom(
  (get) => get(historyAtom)[get(historyAtom).length - 1],
  (get, set, url: string) => {
    set(historyAtom, [...get(historyAtom), url]);
  }
);
export const viewsAtom = atom<{ [key: string]: JSX.Element }>({});

const NativeRouter: any = ({ children }) => {
  const { url, navigate } = useNestedHistory();
  const [views, setViews] = useAtom(viewsAtom);
  const screens = [
    ...new Set(history.filter((url) => views[url]).reverse()),
  ].reverse();
  const [shouldPopExistingScreens, popCheckbox] = useCheckbox(
    "shouldPopExisting",
    true
  );

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
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            style={{ width: "100%", backgroundColor: "gray" }}
            value={url}
            onChangeText={setUrl}
          />
          {Object.keys(views).map((v) => (
            <TouchableOpacity
              key={v}
              style={{ padding: 5 }}
              onPress={() => navigate(v)}
            >
              <Text>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {popCheckbox}
      </View>
      <ScreenStack style={{ flex: 1 }}>
        {screens.map((currUrl, idx) => (
          <Screen
            // stackAnimation="fade"
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
