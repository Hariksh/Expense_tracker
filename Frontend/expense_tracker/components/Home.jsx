import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Card } from "react-native-paper";

const HomePage = ({ navigation }) => (
  <View style={styles.container}>
    <Card style={styles.card}>
      <Card.Content style={{ alignItems: "center" }}>
        <Text style={styles.title}>Welcome to Expense Tracker</Text>
        <Text style={styles.subtitle}>
          Track your expenses and stay on top of your budget
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Expense")}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Add your expense
        </Button>
      </Card.Content>
    </Card>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  card: {
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});

export default HomePage;
