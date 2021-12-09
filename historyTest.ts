import { getCurrentUrlFromHistory, pushUrlToHistory, undo } from "./history";
export const run = () => {
  //   console.log(
  //     getCurrentUrlFromHistory({
  //       prefixes: {
  //         "/": { index: 0, segments: ["test"] },
  //         "/test": { index: -1, segments: [] },
  //       },
  //     })
  //   );
  //   const h = pushUrlToHistory(
  //     {
  //       prefixes: {
  //         "/": { index: 0, segments: ["test"] },
  //         "/test": { index: -1, segments: [] },
  //       },
  //     },
  //     "/test/friend/1/2"
  //   );
  //   console.log({ h });
  //   console.log(getCurrentUrlFromHistory(h));
  const h = {
    prefixes: {
      "/": {
        index: 0,
        segments: ["mates"],
      },
      "/mates": {
        index: 0,
        segments: ["bestmate", "othermates"],
      },
      "/mates/bestmate": {
        index: -1,
        segments: [],
      },
      "/mates/othermates": {
        index: -1,
        segments: [],
      },
    },
  };
  undo(h);
};
