import React, { FC } from "react";
import { Text, TouchableOpacity } from "react-native";
import { useHref, useLocation, useNavigate } from "react-router";
import useNestedHistory from "./useNestedHistory";

export const Link: FC<
  { to: string; back?: undefined } | { back: boolean; to?: undefined }
> = ({ children, to, back }) => {
  let navigate = useNavigate();
  return (
    <TouchableOpacity
      onPress={() => {
        console.log("attempting link open");
        back ? navigate(-1) : navigate(to || "");
      }}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  );
};
