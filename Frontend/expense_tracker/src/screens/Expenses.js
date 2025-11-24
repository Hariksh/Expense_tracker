import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import { ThemeContext } from "../context/ThemeContext";


export default function Expenses({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { colors } = theme;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setItems(res.data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  useEffect(() => {
    loadExpenses();

    const unsubscribe = navigation.addListener('focus', () => {
      loadExpenses();
    });

    return unsubscribe;
  }, [navigation]);

  const renderExpenseItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.expenseCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
    >
      <Text style={[styles.expenseTitle, { color: colors.text }]}>{item.title}</Text>

      <View style={styles.expenseDetail}>
        <Text style={[styles.amount, { color: colors.primary }]}>₹{parseFloat(item.amount).toFixed(2)}</Text>
        <Text style={{ color: colors.subText }}>{item.type}</Text>
      </View>

      <View style={styles.expenseDetail}>
        <Text style={{ color: colors.subText }}>
          {new Date(item.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
        <Text style={{ color: item.paid_by === 'you' ? colors.primary : colors.danger }}>
          {item.paid_by === 'you' ? 'You paid' : 'You owe'}
        </Text>
      </View>

      {item.splits?.length > 0 && (
        <View style={{ marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.subText, marginBottom: 4 }}>Splits:</Text>
          {item.splits.map((split, index) => (
            <View key={split.id || index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text }}>{split.user ? split.user.name : (split.groupMember ? split.groupMember.name : `User ${split.userId}`)}</Text>
              <Text style={{ color: colors.text }}>₹{parseFloat(split.shareAmount || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Expenses</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("AddExpense")}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.subText} />
          <Text style={[styles.emptyText, { color: colors.subText }]}>No expenses yet</Text>
          <Text style={[styles.emptyText, { marginTop: 8, color: colors.subText }]}>
            Tap the + button to add your first expense
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderExpenseItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  addButton: {
    backgroundColor: "#2e7d32",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  expenseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2c3e50",
  },
  expenseDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  amount: {
    fontWeight: "bold",
    color: "#2e7d32",
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});