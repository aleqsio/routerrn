import React, { useState } from "react";
import Checkbox from "expo-checkbox";
import { Text, View } from "react-native";

export default (label: string, def?: boolean) => {
  const [value, setValue] = useState(def);
  return [
    value,
    <View style={{ flexDirection: "row" }}>
      <Text>{label}</Text>
      <Checkbox value={value} onValueChange={setValue} />
    </View>,
  ];
};
