import { useAtom } from "jotai";
import React, { FC, ReactText, useEffect } from "react";
import { viewsAtom } from "./NativeRouter";

export const getPath = (parentPath: string | undefined, path: string) => {
  if (!parentPath) {
    return path;
  }
  return `${parentPath}/${path}`;
};

const Route: FC<{
  path: string;
  parentPath?: string;
  element: JSX.Element;
}> = ({ children, path, parentPath, element }) => {
  const [views, setViews] = useAtom(viewsAtom);
  useEffect(() => {
    // const viewsMap =
    //   React.Children.map(children, (child) => {
    //     console.log(child);
    //     if (!React.isValidElement(child) || !child.props.path) return null;
    //     return {
    //       key: getPath(parentPath, child.props.path),
    //       element: child.props.element,
    //     };
    //   }) || [];
    setViews((views) => ({
      ...views,
      [getPath(parentPath, path)]: element,
      // ...Object.fromEntries(viewsMap.map(({ key, element }) => [key, element])),
    }));
    // return () => {
    //   setViews((views) => {
    //     if (!(getPath(parentPath, path) in views)) return views;
    //     const { [getPath(parentPath, path)]: ommited, ...rest } = views;
    //     return rest;
    //   });
    // };
  }, [path, parentPath, element]);
  return (
    React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null;
      return React.cloneElement(child, {
        parentPath: getPath(parentPath, path),
      });
    }) || null
  );
};
export default Route;
