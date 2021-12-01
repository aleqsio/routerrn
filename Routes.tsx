import React, { FC } from "react";
import { getChildrenWithProps } from "./utils";

type RouterTree = Node[];

const Routes: FC<{ routerTree?: RouterTree }> = ({ children, routerTree }) => {
  const node = {
    type: "routes",
  };
  return getChildrenWithProps(children, {
    routerTree: routerTree ? [...routerTree, node] : [node],
  });
};
export default Routes;
