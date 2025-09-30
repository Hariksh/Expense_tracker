import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeStackScreen from "./components/HomeStack";
import FriendPage from "./components/Friend";
import LoginPage from "./components/Login";
import SignUpPage from "./components/SignUp";

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginPageWrapper} />
      <AuthStack.Screen name="SignUp" component={SignUpPage} />
    </AuthStack.Navigator>
  );
}

// Wrapper to pass navigation to LoginPage for SignUp switch
function LoginPageWrapper({ navigation }) {
  return (
    <LoginPage
      onLogin={(email, password) => console.log("Login:", email, password)}
      switchToSignUp={() => navigation.navigate("SignUp")}
    />
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Friends"
          component={FriendPage}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Auth"
          component={AuthStackScreen}
          options={{ headerShown: false, title: "Login" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
