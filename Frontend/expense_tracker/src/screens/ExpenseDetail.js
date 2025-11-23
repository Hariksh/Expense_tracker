import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function ExpenseDetail({ navigation, route }) {
    const { expenseId } = route.params;
    const { user } = useContext(AuthContext);
    const [expense, setExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadExpense();
    }, []);

    const loadExpense = async () => {
        try {
            const res = await api.get(`/expenses/${expenseId}`);
            setExpense(res.data);
        } catch (error) {
            console.error('Error loading expense:', error);
            Alert.alert('Error', 'Failed to load expense details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await api.delete(`/expenses/${expenseId}`);
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting expense:', error);
                            Alert.alert('Error', 'Failed to delete expense');
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
            </View>
        );
    }

    if (!expense) return null;

    const isPayer = expense.paidBy === user.id;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Expense Details</Text>
                {isPayer ? (
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddExpense', { expenseId: expense.id, isEditing: true })}
                            style={{ marginRight: 16 }}
                        >
                            <Ionicons name="create-outline" size={24} color="#2e7d32" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} disabled={deleting}>
                            {deleting ? (
                                <ActivityIndicator size="small" color="#e53935" />
                            ) : (
                                <Ionicons name="trash-outline" size={24} color="#e53935" />
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ width: 24 }} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>{expense.title}</Text>
                    <Text style={styles.amount}>₹{parseFloat(expense.amount).toFixed(2)}</Text>
                    <Text style={styles.date}>
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{expense.type}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Paid By</Text>
                    <View style={styles.userRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {isPayer ? "Y" : "U"}
                            </Text>
                        </View>
                        <Text style={styles.userName}>
                            {isPayer ? "You" : `User ${expense.paidBy}`}
                        </Text>
                        <Text style={styles.userAmount}>
                            ₹{parseFloat(expense.amount).toFixed(2)}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Split With</Text>
                    {expense.splits.map((split) => (
                        <View key={split.id} style={styles.userRow}>
                            <View style={[styles.avatar, { backgroundColor: '#e0e0e0' }]}>
                                <Text style={[styles.avatarText, { color: '#757575' }]}>
                                    {split.userId === user.id ? "Y" : "U"}
                                </Text>
                            </View>
                            <Text style={styles.userName}>
                                {split.userId === user.id ? "You" : `User ${split.userId}`}
                            </Text>
                            <Text style={styles.userAmount}>
                                ₹{parseFloat(split.shareAmount).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2c3e50",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2c3e50",
        marginBottom: 8,
        textAlign: "center",
    },
    amount: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#2e7d32",
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: "#6c757d",
        marginBottom: 16,
    },
    badge: {
        backgroundColor: "#e8f5e9",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    badgeText: {
        color: "#2e7d32",
        fontWeight: "600",
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 12,
        marginLeft: 4,
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#2e7d32",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    userName: {
        flex: 1,
        fontSize: 16,
        color: "#2c3e50",
    },
    userAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
    },
});
