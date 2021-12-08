import { combineUrls, last } from "./utils";
import produce from "immer";

export type NestedHistory = {
  prefixes: { [prefix: string]: string[]; "/": string[] };
};

const reccurentGetUrlFromHistory = (
  history: NestedHistory,
  pathPrefix = "/"
): string => {
  const nextPathSegment = last(history.prefixes[pathPrefix]);
  if (!nextPathSegment) return "";

  return combineUrls(
    last(history.prefixes[pathPrefix]),
    reccurentGetUrlFromHistory(
      history,
      combineUrls(pathPrefix, nextPathSegment)
    )
  );
};

export const getCurrentUrlFromHistory = (history: NestedHistory) => {
  return reccurentGetUrlFromHistory(history);
};

export const pushUrlToHistory = (history: NestedHistory, url: string) => {
  const urlSegments = ["/", ...url.replace(/(\*|\/)$/, "").split("/")];
  const newHistory = produce(history, (draft) => {
    urlSegments.forEach((part, index) => {
      const prefix = combineUrls(...urlSegments.slice(0, index + 1));
      if (
        !draft.prefixes[prefix] ||
        draft.prefixes[prefix][draft.prefixes[prefix].length - 1] !==
          urlSegments[index + 1]
      ) {
        // maybe add poping from history if duplicate entry is added
        // const existingSameUrlIndex = draft.prefixes[prefix].findIndex(
        //   (part) => part === parts[index + 1]
        // );
        // if (existingSameUrlIndex === -1) {
        draft.prefixes[prefix] = [
          ...(draft.prefixes[prefix] || []),
          ...(urlSegments[index + 1] ? [urlSegments[index + 1]] : []),
        ];
        // }
      }
    });
    if (!url.endsWith("*")) {
      draft.prefixes = {
        "/": draft.prefixes["/"],
        ...Object.fromEntries(
          Object.entries(draft.prefixes).filter(
            ([key]) => !key.startsWith(`/${url.replace(/(\*|\/)$/, "")}`)
          )
        ),
      };
    }
  });
  return newHistory;
};

const undoRecursive = (
  history: NestedHistory,
  onPath?: string
): NestedHistory => {
  const url = getCurrentUrlFromHistory(history);
  let path = onPath?.startsWith("/")
    ? onPath
    : combineUrls("/", onPath || url || undefined);
  console.log({ path });
  const prefixes = history.prefixes[path];
  if (!prefixes) {
    if (path === "/") {
      console.log("UNHANDLED UNDO, SHOULD EXIT APP");
      return history;
    }
    return undoRecursive(history, combineUrls(...path.split("/").slice(0, -1)));
  } else if (prefixes.length === 1) {
    return produce(history, (draft) => {
      if (path === "/") {
        console.log("UNHANDLED UNDO, SHOULD EXIT APP");
      } else {
        draft.prefixes[path] = [];
      }
    });
  } else {
    return produce(history, (draft) => {
      draft.prefixes[path].pop();
    });
  }
};
export const undo = (history: NestedHistory, path?: string): NestedHistory => {
  return undoRecursive(history, path);
};
