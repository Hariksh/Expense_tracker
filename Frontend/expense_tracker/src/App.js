import React from "react";
import AuthProvider from "./context/AuthContext";
import RootNav from "./navigation";

export default function App() {
  return (
    <AuthProvider>
      <RootNav />
    </AuthProvider>
  );
}
