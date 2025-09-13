import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./components/Home/Home.jsx";
import Friends from "./components/Friends/Friends.jsx";
import Account from "./components/Account/Account.jsx";
import Group from "./components/Home/Group.jsx"; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Friends" component={Friends} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Close"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Group" component={Group} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
