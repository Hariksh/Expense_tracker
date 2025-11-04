import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Component for the member selection item
const MemberItem = ({ user, selected, onToggle }) => (
  <TouchableOpacity 
    style={[styles.memberItem, selected && styles.memberItemSelected]}
    onPress={() => onToggle(user.id)}
  >
    <View style={styles.memberInfo}>
      <View style={[styles.avatar, { backgroundColor: selected ? '#2e7d32' : '#e0e0e0' }]}>
        <Text style={[styles.avatarText, { color: selected ? '#fff' : '#757575' }]}>
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </Text>
      </View>
      <Text style={styles.memberName}>{user.name || user.email}</Text>
    </View>
    {selected && <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />}
  </TouchableOpacity>
);

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
  groupCard: {
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
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  memberCount: {
    color: '#6c757d',
    marginBottom: 4,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default function Groups({ navigation }) {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadGroups = async () => {
    try {
      // Load groups
      const groupsRes = await api.get("/groups");
      setGroups(groupsRes.data || []);
      
      // Load all users (excluding current user)
      const usersRes = await api.get("/users");
      setAllUsers(usersRes.data.filter(u => u.id !== user?.id) || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    setIsCreating(true);
    try {
      const groupData = {
        name: name.trim(),
        members: [...selectedMembers, user.id] // Include current user as a member
      };
      
      const response = await api.post("/groups", groupData);
      
      // Reset form
      setName("");
      setSelectedMembers([]);
      setShowModal(false);
      
      // Refresh groups list
      await loadGroups();
      
      // Navigate to group details
      navigation.navigate('GroupDetails', { groupId: response.data.id });
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };
  
  const toggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.groupCard}
      onPress={() => {
        navigation.navigate('GroupDetails', { 
          groupId: item.id,
          groupName: item.name 
        });
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.memberCount}>
            {item.members?.length || 0} {item.members?.length === 1 ? 'member' : 'members'}
          </Text>
        </View>
        
        {item.recentExpense && (
          <Text style={{ color: '#6c757d', fontSize: 14, marginTop: 4 }}>
            Last expense: {item.recentExpense}
          </Text>
        )}
        
        {item.members && item.members.length > 0 && (
          <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' }}>
            {item.members.slice(0, 4).map((member, index) => (
              <View key={index} style={[styles.avatar, { 
                marginLeft: index > 0 ? -10 : 0,
                borderWidth: 2,
                borderColor: '#fff',
                zIndex: 10 - index
              }]}>
                <Text style={[styles.avatarText, { fontSize: 12 }]}>
                  {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            ))}
            {item.members.length > 4 && (
              <View style={[styles.avatar, { 
                backgroundColor: '#e0e0e0',
                marginLeft: -10,
                zIndex: 5,
                justifyContent: 'center',
                alignItems: 'center'
              }]}>
                <Text style={[styles.avatarText, { fontSize: 12, color: '#757575' }]}>
                  +{item.members.length - 4}
                </Text>
              </View>
            )}
          </View>
        )}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="people" size={20} color="white" />
          <Text style={styles.buttonText}>New Group</Text>
        </TouchableOpacity>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#e9ecef" />
          <Text style={styles.emptyText}>No groups yet</Text>
          <Text style={[styles.emptyText, { marginTop: 8 }]}>
            Create your first group to start splitting expenses
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { marginTop: 20, paddingHorizontal: 20 }]}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.buttonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGroupItem}
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

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.modalTitle}>Create New Group</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.sectionTitle}>Group Name</Text>
              <TextInput
                placeholder="e.g., Roommates, Trip to Bali"
                value={name}
                onChangeText={setName}
                style={[styles.input, { marginBottom: 24 }]}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={Keyboard.dismiss}
              />
              
              <Text style={styles.sectionTitle}>Add Members</Text>
              <View style={{ maxHeight: 300, marginBottom: 24 }}>
                <ScrollView>
                  {allUsers.map(user => (
                    <MemberItem
                      key={user.id}
                      user={user}
                      selected={selectedMembers.includes(user.id)}
                      onToggle={toggleMember}
                    />
                  ))}
                  {allUsers.length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#6c757d', marginTop: 16 }}>
                      No contacts found
                    </Text>
                  )}
                </ScrollView>
              </View>
              
              <View style={[styles.buttonRow, { marginTop: 'auto' }]}>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={[styles.cancelButton, { flex: 1 }]}
                  disabled={isCreating}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateGroup}
                  style={[styles.createButton, { flex: 1 }]}
                  disabled={!name.trim() || selectedMembers.length === 0 || isCreating}
                >
                  {isCreating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createButtonText}>Create Group</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
