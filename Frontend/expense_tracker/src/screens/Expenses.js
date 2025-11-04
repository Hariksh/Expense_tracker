import React, { useEffect, useState } from "react";
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  addButton: {
    backgroundColor: '#2e7d32',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  expenseDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amount: {
    fontWeight: 'bold',
    color: '#2e7d32',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function Expenses({ navigation }) {
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
      style={styles.expenseCard}
      onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
    >
      <Text style={styles.expenseTitle}>{item.title}</Text>
      
      <View style={styles.expenseDetail}>
        <Text style={styles.amount}>₹{parseFloat(item.amount).toFixed(2)}</Text>
        <Text style={{ color: '#6c757d' }}>{item.type}</Text>
      </View>
      
      <View style={styles.expenseDetail}>
        <Text style={{ color: '#6c757d' }}>
          {new Date(item.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
        <Text style={{ color: item.paid_by === 'you' ? '#2e7d32' : '#dc3545' }}>
          {item.paid_by === 'you' ? 'You paid' : 'You owe'}
        </Text>
      </View>
      
      {item.splits?.length > 0 && (
        <View style={{ marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e9ecef' }}>
          <Text style={{ color: '#6c757d', marginBottom: 4 }}>Splits:</Text>
          {item.splits.map((split, index) => (
            <View key={split.id || index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>User {split.userId}</Text>
              <Text>₹{parseFloat(split.shareAmount || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddExpense")}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#e9ecef" />
          <Text style={styles.emptyText}>No expenses yet</Text>
          <Text style={[styles.emptyText, { marginTop: 8 }]}>
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
              colors={['#2e7d32']}
              tintColor="#2e7d32"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
