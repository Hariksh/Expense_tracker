import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const friends = [
];

const FriendPage = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Friends</Text>
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.Item}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
      )}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: "#fff" 
    },
    title:{
        fontSize: 24,
        fontWeight: "bold",
        color: "#388e3c",
        marginBottom: 16,
    },
    Item:{ 
        padding: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: "#eee" 
    },
    name:{ 
        fontSize: 18, 
        color: "#333" 
    },
});

export default FriendPage;
