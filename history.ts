import { combineUrls } from "./utils";
import produce from "immer";

export type PrefixHistory = {
  index: number;
  segments: string[];
};

export type NestedHistory = {
  prefixes: { [prefix: string]: PrefixHistory; "/": PrefixHistory };
};

const reccurentGetUrlFromHistory = (
  history: NestedHistory,
  pathPrefix = "/"
): string => {
  const nextPrefixObject = history.prefixes[pathPrefix];
  if (!nextPrefixObject) {
    console.warn(history, pathPrefix, nextPrefixObject);
    throw new Error("path Prefix not found");
  }
  if (nextPrefixObject.index < 0) return "";
  const segment = history.prefixes[pathPrefix].segments[nextPrefixObject.index];
  if (!segment) throw new Error("segment is null");
  const nextPrefix = combineUrls(pathPrefix, segment);
  return combineUrls(segment, reccurentGetUrlFromHistory(history, nextPrefix));
};

export const getCurrentUrlFromHistory = (history: NestedHistory) => {
  const url = combineUrls("/", reccurentGetUrlFromHistory(history));
  return url;
};

export const pushUrlToHistory = (history: NestedHistory, url: string) => {
  console.log("push", url);
  const newUrlSegments = [
    "/",
    ...url
      .replace(/(\*|\/)$/, "")
      .split("/")
      .filter((f) => !!f), // url contains empty string, fix!
  ];
  console.log(newUrlSegments);
  const newHistory = produce(history, (draft) => {
    newUrlSegments.forEach((newSegment, newUrlSegmentIndex) => {
      const prefix = combineUrls(
        ...newUrlSegments.slice(0, newUrlSegmentIndex + 1)
      );
      draft.prefixes[prefix];
      if (!draft.prefixes[prefix]) {
        draft.prefixes[prefix] = {
          index: -1,
          segments: [],
        };
      }
      if (newUrlSegments[newUrlSegmentIndex + 1]) {
        if (
          draft.prefixes[prefix].segments[draft.prefixes[prefix].index] !==
          newUrlSegments[newUrlSegmentIndex + 1]
        ) {
          draft.prefixes[prefix].segments = [
            ...draft.prefixes[prefix].segments.slice(
              0,
              draft.prefixes[prefix].index + 1
            ),
            newUrlSegments[newUrlSegmentIndex + 1],
          ];
          draft.prefixes[prefix].index =
            draft.prefixes[prefix].segments.length - 1;
        } else if (
          draft.prefixes[prefix].segments[draft.prefixes[prefix].index + 1] ===
          newUrlSegments[newUrlSegmentIndex + 1]
        ) {
          draft.prefixes[prefix].index += 1;
        }
      }

      // if (
      //   !draft.prefixes[prefix] ||
      //   draft.prefixes[prefix][draft.prefixes[prefix].length - 1] !==
      //     newUrlSegments[newUrlSegmentIndex + 1]
      // ) {
      //   // maybe add poping from history if duplicate entry is added
      //   // const existingSameUrlIndex = draft.prefixes[prefix].findIndex(
      //   //   (part) => part === parts[index + 1]
      //   // );
      //   // if (existingSameUrlIndex === -1) {
      //   draft.prefixes[prefix] = [
      //     ...(draft.prefixes[prefix] || []),
      //     ...(urlSegments[index + 1] ? [urlSegments[index + 1]] : []),
      //   ];
      //   // }
      // }
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
  onPath?: string,
  maxDepth?: number
): NestedHistory => {
  if (maxDepth === 0) {
    console.warn("max depth reached");
    return history;
  }
  const url = getCurrentUrlFromHistory(history);
  let path = onPath?.startsWith("/")
    ? onPath
    : combineUrls("/", onPath || url || undefined);
  const prefixes = history.prefixes[path];
  if (!prefixes) {
    return undoRecursive(
      history,
      combineUrls(...path.split("/").slice(0, -1)),
      maxDepth || 0 - 1
    );
  }

  if (history.prefixes[path].index < 0) {
    if (path === "/") {
      console.log("UNHANDLED UNDO, SHOULD EXIT APP");
      return history;
    }
    return undoRecursive(
      history,
      combineUrls(...path.split("/").slice(0, -1)),
      maxDepth || 0 - 1
    );
  } else {
    const newHistory = produce(history, (draft) => {
      draft.prefixes[path].index -= 1;
    });
    return newHistory;
  }

  // if (!prefixes || prefixes.length === 0) {
  //   if (path === "/") {
  //     console.log("UNHANDLED UNDO, SHOULD EXIT APP");
  //     return history;
  //   }
  //   console.log("NO PREFIXES");
  //   return undoRecursive(history, combineUrls(...path.split("/").slice(0, -1)));
  // } else if (prefixes.length === 1) {
  //   console.log("1 PREFIXE");
  //   if (path === "/") {
  //     console.log("UNHANDLED UNDO, SHOULD EXIT APP");
  //     return history;
  //   } else {
  //     return undoRecursive(
  //       produce(history, (draft) => {
  //         draft.prefixes[path] = [];
  //       }),
  //       combineUrls(...path.split("/").slice(0, -1))
  //     );
  //   }
  // } else {
  //   console.log("MANY PREFIXES");
  //   return produce(history, (draft) => {
  //     draft.prefixes[path].pop();
  //   });
  // }
};
export const undo = (history: NestedHistory, path?: string): NestedHistory => {
  const newHistory = undoRecursive(history, path, 10);
  console.warn(newHistory);
  return newHistory;
};
