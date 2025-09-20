import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePage from "./components/Home";
import FriendPage from "./components/Friend";
import LoginPage from "./components/Login"; 

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomePage} />
        <Tab.Screen name="Friends" component={FriendPage} />
        <Tab.Screen name="Login" component={LoginPage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
