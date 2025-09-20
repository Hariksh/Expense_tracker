import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomePage = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome to Expense Tracker</Text>
    <Text style={styles.subtitle}>
      Track your expenses and manage your budget easily!
    </Text>
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
    marginBottom: 12,
  },
  subtitle: { 
    fontSize: 16, 
    color: "#555" 
},
});

export default HomePage;
