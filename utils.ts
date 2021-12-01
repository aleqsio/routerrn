import React from "react";

export const getChildrenWithProps = (children: any, props: any) => {
  return (
    React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null;
      return React.cloneElement(child, props);
    }) || null
  );
};
