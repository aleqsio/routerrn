import { atom, useAtom } from "jotai";
import React, {
  FC,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
import { Router, To } from "react-router";
import { NestedHistory } from "./history";
import useCheckbox from "./useCheckbox";

import useNestedHistory from "./useNestedHistory";

const NativeRouterContext = React.createContext<{
  history: NestedHistory;
  undo: (onPath?: string | undefined) => void;
}>({
  history: { prefixes: { "/": { index: -1, segments: [] } } },
  undo: () => {},
});

export const useNestedHistoryContext = () => useContext(NativeRouterContext);

const NativeRouter: FC = ({ children }) => {
  const { url, undo, navigate, history } = useNestedHistory();
  console.log(url);
  return (
    <NativeRouterContext.Provider value={{ history, undo }}>
      <Router
        location={url}
        navigator={{
          go: (delta: number) => {
            if (delta !== -1) console.log("not supported yet");
            console.log("GOBACK");
            undo();
          },
          push: (url: To) => {
            navigate(url.pathname);
          },
          replace: () => console.log("not supported yet"),
          createHref: () => {
            console.log("not supported yet");
            return "";
          },
        }}
        children={children}
      />
    </NativeRouterContext.Provider>
  );
};
export default NativeRouter;
