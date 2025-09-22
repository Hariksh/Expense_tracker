import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const HomePage = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome to Expense Tracker</Text>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("Expense")}>
      <Text style={styles.buttonText}>Add your expense</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#388e3c",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default HomePage;
