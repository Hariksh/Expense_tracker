import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomePage from "./Home";
import ExpensePage from "./Expense"; // your expense tracker page

const Stack = createNativeStackNavigator();

export default function HomeStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }}/>
      <Stack.Screen name="Expense" component={ExpensePage} />
    </Stack.Navigator>
  );
}
