import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function Expenses() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const categories = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Other"];
  const categoryColor = {
    Food: "#FF6B6B",
    Transport: "#4ECDC4",
    Shopping: "#FFE66D",
    Entertainment: "#6A4C93",
    Bills: "#FF9F1C",
    Health: "#4D96FF",
    Other: "#95A5A6",
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_URL}/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const resetForm = () => {
    setCategory("");
    setAmount("");
    setNote("");
    setDate(new Date());
    setEditingId(null);
  };

  const addExpense = async () => {
    if (!category || !amount) return;
    try {
      await axios.post(`${API_URL}/expenses`, {
        amount,
        category,
        note,
        date: date.toISOString().slice(0, 10),
      });
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.log(err);
    }
  };

  const updateExpense = async () => {
    if (!category || !amount || !editingId) return;
    try {
      await axios.put(`${API_URL}/expenses/${editingId}`, {
        amount,
        category,
        note,
        date: date.toISOString().slice(0, 10),
      });
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteExpense = async (id) => {
    await axios.delete(`${API_URL}/expenses/${id}`);
    fetchExpenses();
  };

  const startEdit = (item) => {
    setCategory(item.category);
    setAmount(item.amount.toString());
    setNote(item.note || "");
    setDate(new Date(item.date));
    setEditingId(item.id);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const renderExpenseItem = ({ item }) => (
    <View style={[styles.card, { borderLeftColor: categoryColor[item.category] || "#95A5A6" }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardCategory, { color: categoryColor[item.category] || "#333" }]}>{item.category}</Text>
        <Text style={styles.cardAmount}>₹{item.amount}</Text>
        {item.note ? <Text style={styles.cardNote}>{item.note}</Text> : null}
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteExpense(item.id)}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>

      <View style={styles.categoryWrapper}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBtn,
              { backgroundColor: category === cat ? categoryColor[cat] : "#fff", borderColor: categoryColor[cat] },
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={{ color: category === cat ? "#fff" : categoryColor[cat], fontWeight: "bold" }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
      />
      <TextInput style={styles.input} placeholder="Note (optional)" value={note} onChangeText={setNote} />

      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Select Date: {date.toISOString().slice(0, 10)}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
      )}

      <TouchableOpacity style={styles.addBtn} onPress={editingId ? updateExpense : addExpense}>
        <Text style={styles.addBtnText}>{editingId ? "Update Expense" : "Add Expense"}</Text>
      </TouchableOpacity>

      <FlatList data={expenses} keyExtractor={(item) => item.id?.toString()} renderItem={renderExpenseItem} style={{ width: "100%", marginTop: 10 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f7", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#2e7d32", marginBottom: 20, textAlign: "center" },
  categoryWrapper: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  categoryBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 10, fontSize: 16, marginBottom: 12 },
  dateBtn: { backgroundColor: "#2e7d32", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 12 },
  addBtn: { backgroundColor: "#2e7d32", padding: 16, borderRadius: 10, marginBottom: 20 },
  addBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center" },
  card: { flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, borderLeftWidth: 6, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardCategory: { fontSize: 16, fontWeight: "bold" },
  cardAmount: { fontSize: 18, fontWeight: "bold", marginTop: 4, color: "#2e7d32" },
  cardNote: { fontSize: 14, fontStyle: "italic", color: "#555", marginTop: 4 },
  cardDate: { fontSize: 14, color: "#555", marginTop: 2 },
  cardActions: { flexDirection: "row", alignItems: "center" },
  editBtn: { backgroundColor: "#0288d1", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 },
  deleteBtn: { backgroundColor: "#e53935", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  actionText: { color: "#fff", fontWeight: "bold" },
});
