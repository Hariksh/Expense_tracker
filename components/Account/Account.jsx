import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const Account = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://i.pravatar.cc/150?img=3" }}
        style={styles.avatar}
      />
      <Text style={styles.name}>Hariksh Mahendra Suryawanashi</Text>
      <Text style={styles.email}>hariksh@example.com</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Total Groups</Text>
        <Text style={styles.infoValue}>3</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingTop: 60,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: "80%",
  },
  infoLabel: {
    fontSize: 16,
    color: "#888",
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#e53935",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Account;
