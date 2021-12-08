import React from "react";

export const getChildrenWithProps = (children: any, props: any) => {
  return (
    React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null;
      return React.cloneElement(child, props);
    }) || null
  );
};

export const last = <T>(a: T[]) => {
  if (!a) return undefined;
  return a[a.length - 1];
};

export const combineUrls = (...urls: (string | undefined)[]) => {
  // remove all multiple slashes, remove * or / from the end
  const path = urls.join("/").replaceAll(/\/+/g, "/");
  if (path !== "/") return path.replace(/(\*|\/)$/, "");
  return path;
};
