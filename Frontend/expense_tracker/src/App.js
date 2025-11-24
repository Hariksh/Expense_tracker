import React from "react";
import AuthProvider from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import RootNav from "./navigation";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
