import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function Expenses() {
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_URL}/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.log("Error fetching", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async () => {
    if (expense && amount) {
      try {
        await axios.post(`${API_URL}/expenses`, {
          amount,
          category: expense,
          note: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setExpense("");
        setAmount("");
        fetchExpenses();
      } catch (err) {
        console.log("Error adding expense:", err);
      }
    }
  };

  const deleteExpense = async (id) => {
      await axios.delete(`${API_URL}/expenses/${id}`);
      fetchExpenses();
  };

  const startEdit = (item) => {
    setExpense(item.category);
    setAmount(item.amount.toString());
    setEditingId(item.id);
  };

  const updateExpense = async () => {
    if (expense && amount && editingId) {
      try {
        await axios.put(`${API_URL}/expenses/${editingId}`, {
          amount,
          category: expense,
          note: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setExpense("");
        setAmount("");
        setEditingId(null);
        fetchExpenses();
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter expense"
        value={expense}
        onChangeText={setExpense}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={editingId ? updateExpense : addExpense}
      >
        <Text style={styles.buttonText}>
          {editingId ? "Update Expense" : "Add Expense"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.expenseRow}>
            <Text style={styles.expenseItem}>
              {item.category} - {item.amount}
            </Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)}>
            <Text style={{ color: "#fff" }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteExpense(item.id)}>
            <Text style={{ color: "#fff" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#388e3c",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#388e3c",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  list: {
    width: "100%",
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 6,
  },
  expenseItem: {
    fontSize: 16,
    flex: 1,
  },
  editBtn: {
    backgroundColor: "lightblue",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: "#e53935",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
});
