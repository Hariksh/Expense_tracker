import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;

const Group = () => (
  <View style={styles.container}>
    <TextInput
      style={styles.title}
      placeholder="Enter group name"
      placeholderTextColor="#388e3c"
    />
    <View style={styles.row}>
      <TouchableOpacity style={styles.box}>
        <MaterialCommunityIcons
          name="airplane"
          color="#388e3c"
          size={24}
          style={styles.icon}
        />
        <Text style={styles.Button_text}>Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.box}>
        <Ionicons name="home" color="#388e3c" size={24} style={styles.icon} />
        <Text style={styles.Button_text}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.box}>
        <View style={styles.iconCenter}>
          <MaterialCommunityIcons name="heart" color="#388e3c" size={24} />
        </View>
        <Text style={styles.Button_text}>Couple</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.box}>
        <MaterialCommunityIcons
          name="dots-horizontal"
          color="#388e3c"
          size={24}
          style={styles.icon}
        />
        <Text style={styles.Button_text}>Others</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  title: {
    width: "85%",
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#388e3c",
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 30,
    backgroundColor: "#fff",
    fontWeight: "bold",
    color: "#388e3c",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: screenWidth,
    marginTop: 10,
    marginBottom: 30,
  },
  box: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#388e3c",
    padding: 10,
    marginHorizontal: 8,
    width: 85,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  icon: {
    alignSelf: "center",
  },
  iconCenter: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  Button_text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#388e3c",
    textAlign: "center",
  },
});

export default Group;
