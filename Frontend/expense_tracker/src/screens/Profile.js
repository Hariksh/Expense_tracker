import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Switch
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import api from "../services/api";


export default function Profile({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  const { colors } = theme;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get("/auth/stats");
        setStats(res.data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: colors.header }]}>
          <View style={[styles.avatar, { backgroundColor: isDark ? '#333' : '#e0e0e0', borderColor: colors.card }]}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats?.totalExpenses || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>Expenses</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats?.totalGroups || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>Groups</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>₹{stats?.totalPaid?.toFixed(2) || '0.00'}</Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>You Paid</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: colors.danger }]}>₹{stats?.totalOwed?.toFixed(2) || '0.00'}</Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>You Owe</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.border }]}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.subText }]}>Name</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.subText }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.subText }]}>Member Since</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.border }]}>Settings</Text>
            <View style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={isDark ? "moon" : "moon-outline"} size={22} color={isDark ? colors.primary : colors.subText} />
                <Text style={{ marginLeft: 12, color: colors.text, fontSize: 16 }}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDark ? "#fff" : "#f4f3f4"}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.danger }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={{
            textAlign: 'center',
            color: colors.subText,
            marginTop: 24,
            marginBottom: 16,
            fontSize: 12
          }}>
            Expense Tracker v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 40,
    color: "#757575",
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 20,
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});