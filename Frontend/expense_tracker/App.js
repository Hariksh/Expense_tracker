import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePage from "./components/Home";
import FriendPage from "./components/Friend";
import LoginPage from "./components/Login"; 
import HomeStackScreen from "./components/HomeStack";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeStackScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Friends" component={FriendPage} options={{ headerShown: false }} />
        <Tab.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
