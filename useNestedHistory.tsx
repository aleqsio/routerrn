import { WritableDraft } from "immer/dist/internal";
import { atom, useAtom } from "jotai";
import { atomWithImmer, useImmerAtom } from "jotai/immer";
import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUrlFromHistory,
  pushUrlToHistory,
  NestedHistory,
  undo,
} from "./history";
import { last } from "./utils";

export const historyAtom = atom<NestedHistory>({
  prefixes: {
    "/": { index: 0, segments: ["mates"] },
    "/mates": { index: 0, segments: ["bestmate"] },
    "/mates/bestmate": { index: -1, segments: [] },
  },
});

// const composeUrl = (history: History, pathPrefix = "ROOT"): string => {
//   const nextPathSegment = last(history.prefixes[pathPrefix]);
//   if (!nextPathSegment) return "";

//   return `${last(history.prefixes[pathPrefix])}/${composeUrl(
//     history,
//     `${pathPrefix}/${nextPathSegment}`
//   )}`;
// };

// const updateHistoryDraftWithUrlOpen = (
//   draft: WritableDraft<History>,
//   url: string
//   // shouldPopExisiting = false
// ) => {
//   const parts = ["ROOT", ...url.replace(/(\*|\/)$/, "").split("/")];
//   parts.forEach((part, index) => {
//     const prefix = parts.slice(0, index + 1).join("/");
//     if (
//       !draft.prefixes[prefix] ||
//       draft.prefixes[prefix][draft.prefixes[prefix].length - 1] !==
//         parts[index + 1]
//     ) {
//       // maybe add poping from history if duplicate entry is added
//       // const existingSameUrlIndex = draft.prefixes[prefix].findIndex(
//       //   (part) => part === parts[index + 1]
//       // );
//       // if (existingSameUrlIndex === -1) {
//       draft.prefixes[prefix] = [
//         ...(draft.prefixes[prefix] || []),
//         ...(parts[index + 1] ? [parts[index + 1]] : []),
//       ];
//       // }
//     }
//   });
//   if (!url.endsWith("*")) {
//     draft.prefixes = {
//       ROOT: draft.prefixes.ROOT,
//       ...Object.fromEntries(
//         Object.entries(draft.prefixes).filter(
//           ([key]) => !key.startsWith(`ROOT/${url.replace(/(\*|\/)$/, "")}`)
//         )
//       ),
//     };
//   }
// };

export const urlAtom = atom(
  (get) => {
    const x = getCurrentUrlFromHistory(get(historyAtom));
    console.log("current Url", x);
    return x;
  },
  (get, set, url: string) => {
    set(historyAtom, (prevHistory) => pushUrlToHistory(prevHistory, url));
  }
);
const useNestedHistory = () => {
  const [history, setHistory] = useAtom(historyAtom);
  console.log(history);
  const [url, setUrl] = useAtom(urlAtom);
  const undoLocal = (onPath?: string) =>
    setHistory((history) => undo(history, onPath));
  return { url, history, navigate: setUrl, undo: undoLocal };
};
export default useNestedHistory;
