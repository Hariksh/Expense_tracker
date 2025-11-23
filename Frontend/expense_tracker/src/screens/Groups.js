import React, { useEffect, useReducer, useContext } from "react";
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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

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

const initialState = {
  groups: [],
  contacts: [],
  searchText: "",
  page: 1,
  hasMore: true,
  loadingContacts: false,
  showAddContact: false,
  newContactEmail: "",
  addingContact: false,
  showModal: false,
  name: "",
  selectedMembers: [],
  loading: true,
  refreshing: false,
  isCreating: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };
    case 'APPEND_CONTACTS':
      return { ...state, contacts: [...state.contacts, ...action.payload] };
    case 'TOGGLE_MEMBER':
      return {
        ...state,
        selectedMembers: state.selectedMembers.includes(action.payload)
          ? state.selectedMembers.filter(id => id !== action.payload)
          : [...state.selectedMembers, action.payload]
      };
    case 'RESET_MODAL':
      return {
        ...state,
        name: "",
        selectedMembers: [],
        showModal: false,
        searchText: "",
        page: 1,
        hasMore: true,
        showAddContact: false,
        newContactEmail: ""
      };
    default:
      return state;
  }
}

export default function Groups({ navigation }) {
  const { user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const {
    groups,
    contacts,
    searchText,
    page,
    hasMore,
    loadingContacts,
    showAddContact,
    newContactEmail,
    addingContact,
    showModal,
    name,
    selectedMembers,
    loading,
    refreshing,
    isCreating
  } = state;

  const loadGroups = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const groupsRes = await Promise.race([
        api.get("/groups"),
        timeoutPromise
      ]);

      dispatch({ type: 'SET_GROUPS', payload: groupsRes.data || [] });
    } catch (error) {
      console.error('Error loading groups:', error);
      if (error.message !== 'Timeout') {
        Alert.alert('Error', 'Failed to load groups');
      }
    } finally {
      dispatch({ type: 'SET_FIELD', field: 'loading', value: false });
      dispatch({ type: 'SET_FIELD', field: 'refreshing', value: false });
    }
  };

  useEffect(() => {
    loadGroups();
    const unsubscribe = navigation.addListener('focus', () => {
      loadGroups();
    });
    return unsubscribe;
  }, [navigation]);

  const loadContacts = async (reset = false) => {
    if (loadingContacts) return;
    if (!reset && !hasMore) return;

    dispatch({ type: 'SET_FIELD', field: 'loadingContacts', value: true });
    try {
      const currentPage = reset ? 1 : page;
      const res = await api.get("/contacts", {
        params: {
          search: searchText,
          page: currentPage,
          limit: 20
        }
      });

      const newContacts = res.data.data || [];
      const pagination = res.data.pagination;

      if (reset) {
        dispatch({ type: 'SET_CONTACTS', payload: newContacts });
      } else {
        dispatch({ type: 'APPEND_CONTACTS', payload: newContacts });
      }

      dispatch({ type: 'SET_FIELD', field: 'hasMore', value: newContacts.length === (pagination?.limit || 20) });
      dispatch({ type: 'SET_FIELD', field: 'page', value: currentPage + 1 });
    } catch (error) {
      console.error('Error loading contacts:', error);
      if (reset) dispatch({ type: 'SET_CONTACTS', payload: [] });
    } finally {
      dispatch({ type: 'SET_FIELD', field: 'loadingContacts', value: false });
    }
  };

  useEffect(() => {
    if (showModal) {
      loadContacts(true);
    }
  }, [showModal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showModal) {
        dispatch({ type: 'SET_FIELD', field: 'page', value: 1 });
        dispatch({ type: 'SET_FIELD', field: 'hasMore', value: true });
        loadContacts(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, showModal]);

  const onRefresh = () => {
    dispatch({ type: 'SET_FIELD', field: 'refreshing', value: true });
    loadGroups();
  };

  const handleAddContact = async () => {
    if (!newContactEmail.trim()) return;
    dispatch({ type: 'SET_FIELD', field: 'addingContact', value: true });
    try {
      await api.post("/contacts", { email: newContactEmail.trim() });
      dispatch({ type: 'SET_FIELD', field: 'newContactEmail', value: "" });
      dispatch({ type: 'SET_FIELD', field: 'showAddContact', value: false });
      Alert.alert("Success", "Contact added successfully");
      
      dispatch({ type: 'SET_FIELD', field: 'page', value: 1 });
      dispatch({ type: 'SET_FIELD', field: 'hasMore', value: true });
      loadContacts(true);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Failed to add contact");
    } finally {
      dispatch({ type: 'SET_FIELD', field: 'addingContact', value: false });
    }
  };

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    dispatch({ type: 'SET_FIELD', field: 'isCreating', value: true });
    try {
      const groupData = {
        name: name.trim(),
        members: [...selectedMembers, user.id].map(id => Number(id))
      };

      const response = await api.post("/groups", groupData);

      dispatch({ type: 'RESET_MODAL' });
      await loadGroups();

      navigation.navigate('GroupDetails', { groupId: response.data.id });
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
    } finally {
      dispatch({ type: 'SET_FIELD', field: 'isCreating', value: false });
    }
  };

  const toggleMember = (userId) => {
    dispatch({ type: 'TOGGLE_MEMBER', payload: userId });
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
          onPress={() => dispatch({ type: 'SET_FIELD', field: 'showModal', value: true })}
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
            onPress={() => dispatch({ type: 'SET_FIELD', field: 'showModal', value: true })}
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
        onRequestClose={() => dispatch({ type: 'SET_FIELD', field: 'showModal', value: false })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.modalTitle}>Create New Group</Text>
                <TouchableOpacity onPress={() => dispatch({ type: 'SET_FIELD', field: 'showModal', value: false })}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Group Name</Text>
              <TextInput
                placeholder="e.g., Roommates, Trip to Bali"
                value={name}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'name', value: text })}
                style={[styles.input, { marginBottom: 24 }]}
                returnKeyType="next"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.sectionTitle}>Add Members</Text>
                <TouchableOpacity onPress={() => dispatch({ type: 'SET_FIELD', field: 'showAddContact', value: !showAddContact })}>
                  <Text style={{ color: '#2e7d32', fontWeight: '600' }}>
                    {showAddContact ? 'Cancel' : '+ Add Contact'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showAddContact && (
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <TextInput
                    placeholder="Enter email address"
                    value={newContactEmail}
                    onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'newContactEmail', value: text })}
                    style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <TouchableOpacity
                    style={[styles.addButton, { paddingHorizontal: 16 }]}
                    onPress={handleAddContact}
                    disabled={addingContact}
                  >
                    {addingContact ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Ionicons name="add" size={24} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <TextInput
                placeholder="Search contacts..."
                value={searchText}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'searchText', value: text })}
                style={[styles.input, { marginBottom: 8 }]}
              />

              <View style={{ height: 250, marginBottom: 24 }}>
                <FlatList
                  data={contacts}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <MemberItem
                      user={item}
                      selected={selectedMembers.includes(item.id)}
                      onToggle={toggleMember}
                    />
                  )}
                  onEndReached={() => loadContacts()}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={loadingContacts && <ActivityIndicator size="small" color="#2e7d32" />}
                  ListEmptyComponent={
                    !loadingContacts && (
                      <Text style={{ textAlign: 'center', color: '#6c757d', marginTop: 16 }}>
                        {searchText ? 'No contacts found' : 'No contacts yet. Add someone!'}
                      </Text>
                    )
                  }
                />
              </View>

              <View style={[styles.buttonRow, { marginTop: 'auto' }]}>
                <TouchableOpacity
                  onPress={() => dispatch({ type: 'SET_FIELD', field: 'showModal', value: false })}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberItemSelected: {
    backgroundColor: '#f0f8f0',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 16,
    color: '#2c3e50',
  },
})
