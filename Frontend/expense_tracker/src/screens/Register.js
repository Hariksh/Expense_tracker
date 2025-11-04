import React, { useContext, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Register({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
        Register
      </Text>
      <TextInput
        placeholder="Name"
        onChangeText={setName}
        value={name}
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#ddd",
        }}
      />
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#ddd",
        }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#ddd",
        }}
      />
      <TouchableOpacity
        style={{ backgroundColor: "#2e7d32", padding: 14, borderRadius: 8 }}
        onPress={async () => {
          const res = await register(name, email, password);
          if (!res.ok) Alert.alert("Registration Failed", res.error);
        }}
      >
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
        >
          Create Account
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: 16 }}
      >
        <Text style={{ textAlign: "center" }}>Have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
