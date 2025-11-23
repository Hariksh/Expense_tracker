import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function GroupDetails({ navigation, route }) {
    const { groupId } = route.params;
    const { user } = useContext(AuthContext);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGroup();

        const unsubscribe = navigation.addListener('focus', () => {
            loadGroup();
        });
        return unsubscribe;
    }, [navigation]);

    const loadGroup = async () => {
        try {
            const res = await api.get(`/groups/${groupId}`);
            setGroup(res.data);
        } catch (error) {
            console.error('Error loading group:', error);
            Alert.alert('Error', 'Failed to load group details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const renderExpenseItem = ({ item }) => (
        <TouchableOpacity
            style={styles.expenseItem}
            onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
        >
            <View style={styles.expenseIcon}>
                <Ionicons name="receipt-outline" size={24} color="#2e7d32" />
            </View>
            <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                <Text style={styles.expenseDate}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.expenseAmount}>
                <Text style={styles.amountText}>₹{parseFloat(item.amount).toFixed(2)}</Text>
                <Text style={styles.paidByText}>
                    {item.paidBy === user.id ? 'You paid' : `User ${item.paidBy} paid`}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
            </View>
        );
    }

    if (!group) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{group.name}</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddExpense', { groupId: group.id })}
                >
                    <Ionicons name="add" size={24} color="#2e7d32" />
                </TouchableOpacity>
            </View>

            <View style={styles.membersSection}>
                <Text style={styles.sectionTitle}>Members ({group.members.length})</Text>
                <FlatList
                    data={group.members}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.memberItem}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {item.user.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                            <Text style={styles.memberName} numberOfLines={1}>
                                {item.user.id === user.id ? 'You' : item.user.name}
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>

            <View style={styles.expensesSection}>
                <Text style={[styles.sectionTitle, { marginHorizontal: 16 }]}>Expenses</Text>
                <FlatList
                    data={group.expenses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderExpenseItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No expenses in this group yet</Text>
                        </View>
                    }
                />
            </View>
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
    membersSection: {
        paddingVertical: 16,
        backgroundColor: "#fff",
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 12,
        marginLeft: 16,
    },
    memberItem: {
        alignItems: "center",
        marginRight: 16,
        width: 60,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#757575",
    },
    memberName: {
        fontSize: 12,
        color: "#2c3e50",
        textAlign: "center",
    },
    expensesSection: {
        flex: 1,
    },
    expenseItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    expenseIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e8f5e9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 4,
    },
    expenseDate: {
        fontSize: 12,
        color: "#6c757d",
    },
    expenseAmount: {
        alignItems: "flex-end",
    },
    amountText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2e7d32",
        marginBottom: 4,
    },
    paidByText: {
        fontSize: 12,
        color: "#6c757d",
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        color: "#6c757d",
        fontSize: 14,
    },
});
