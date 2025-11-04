import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  FlatList
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';

const expenseTypes = [
  'Food', 'Shopping', 'Transport', 'Entertainment', 
  'Bills', 'Travel', 'Health', 'Other'
];

const MemberItem = ({ member, amount, onAmountChange, onToggle, isIncluded }) => (
  <View style={[styles.memberItem, isIncluded && styles.memberItemSelected]}>
    <View style={styles.memberInfo}>
      <View style={[styles.avatar, { backgroundColor: isIncluded ? '#2e7d32' : '#e0e0e0' }]}>
        <Text style={[styles.avatarText, { color: isIncluded ? '#fff' : '#757575' }]}>
          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
        </Text>
      </View>
      <Text style={styles.memberName}>{member.name || member.email}</Text>
    </View>
    
    <View style={styles.amountInputContainer}>
      <Text style={styles.currencySymbol}>₹</Text>
      <TextInput
        style={[styles.amountInput, !isIncluded && styles.amountInputDisabled]}
        value={amount !== null ? amount.toString() : ''}
        onChangeText={(text) => onAmountChange(member.id, text)}
        keyboardType="numeric"
        placeholder="0.00"
        editable={isIncluded}
      />
    </View>
    
    <TouchableOpacity onPress={() => onToggle(member.id)} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, isIncluded && styles.checkboxSelected]}>
        {isIncluded && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    marginLeft: 4,
  },
  amountInputDisabled: {
    color: '#95a5a6',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  typeButtonSelected: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  typeButtonText: {
    color: '#2c3e50',
    fontSize: 14,
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  splitTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  splitTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  splitTypeButtonSelected: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  splitTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  memberItemSelected: {
    borderColor: '#2e7d32',
    backgroundColor: '#f0f8f0',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    height: 40,
    marginRight: 12,
    minWidth: 100,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
  },
  groupSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  groupSelectorText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  groupSelectorPlaceholder: {
    color: '#95a5a6',
  },
  groupSelectorSelected: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  groupItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupItemSelected: {
    backgroundColor: '#f0f8f0',
  },
  groupName: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: '#95a5a6',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default function AddExpense({ navigation, route }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Food");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [members, setMembers] = useState([]);
  const [splitType, setSplitType] = useState("equal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [me, setMe] = useState(null);
  
  // For custom split amounts
  const [customAmounts, setCustomAmounts] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current user
        const userStr = await AsyncStorage.getItem("user");
        const meParsed = userStr ? JSON.parse(userStr) : null;
        setMe(meParsed);
        
        // Load groups and members
        await Promise.all([
          loadGroups(),
        ]);
        
        // If we came from a group, pre-select it
        if (route.params?.groupId) {
          const group = groups.find(g => g.id === route.params.groupId);
          if (group) {
            setSelectedGroup(group);
            await loadGroupMembers(group.id);
          }
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const loadGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      throw error;
    }
  };
  
  const loadGroupMembers = async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      setMembers(response.data || []);
      
      // Initialize custom amounts
      const amounts = {};
      response.data.forEach(member => {
        amounts[member.id] = '';
      });
      setCustomAmounts(amounts);
      
    } catch (error) {
      console.error('Error loading group members:', error);
      throw error;
    }
  };

  const handleGroupSelect = async (group) => {
    setSelectedGroup(group);
    setShowGroupPicker(false);
    await loadGroupMembers(group.id);
  };
  
  const toggleMember = (memberId) => {
    setMembers(prevMembers => 
      prevMembers.map(member => 
        member.id === memberId 
          ? { ...member, isIncluded: !member.isIncluded }
          : member
      )
    );
  };
  
  const handleAmountChange = (memberId, value) => {
    // Only allow numbers and decimal point
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    
    // If empty string, set to empty (to allow clearing)
    if (cleanedValue === '') {
      setCustomAmounts(prev => ({
        ...prev,
        [memberId]: ''
      }));
      return;
    }
    
    // Convert to number and check if valid
    const numValue = parseFloat(cleanedValue);
    if (!isNaN(numValue) && numValue >= 0) {
      setCustomAmounts(prev => ({
        ...prev,
        [memberId]: cleanedValue
      }));
    }
  };
  
  const calculateEqualSplit = () => {
    if (!amount || isNaN(parseFloat(amount)) || members.length === 0) return 0;
    
    const totalAmount = parseFloat(amount);
    const includedMembers = members.filter(m => m.isIncluded);
    
    if (includedMembers.length === 0) return 0;
    
    const share = totalAmount / includedMembers.length;
    return share.toFixed(2);
  };
  
  const validateCustomSplit = () => {
    if (!amount || isNaN(parseFloat(amount))) return false;
    
    const totalAmount = parseFloat(amount);
    const includedMembers = members.filter(m => m.isIncluded);
    
    if (includedMembers.length === 0) return false;
    
    let sum = 0;
    for (const member of includedMembers) {
      const amount = parseFloat(customAmounts[member.id] || '0');
      if (isNaN(amount) || amount < 0) return false;
      sum += amount;
    }
    
    // Allow small floating point differences
    return Math.abs(sum - totalAmount) < 0.01;
  };

  const submit = async () => {
    if (!me) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    
    // Basic validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (selectedGroup && members.filter(m => m.isIncluded).length === 0) {
      Alert.alert('Error', 'Please include at least one member');
      return;
    }
    
    // For custom split, validate the amounts
    if (splitType === 'custom' && !validateCustomSplit()) {
      Alert.alert('Error', 'The sum of individual amounts must equal the total amount');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const expenseData = {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        date: date.toISOString().split('T')[0],
        paid_by: me.id,
        group_id: selectedGroup?.id || null,
        split_type: splitType,
        splits: []
      };
      
      // Prepare the splits
      if (selectedGroup) {
        const includedMembers = members.filter(m => m.isIncluded);
        
        if (splitType === 'equal') {
          const share = parseFloat(amount) / (includedMembers.length || 1);
          
          expenseData.splits = includedMembers.map(member => ({
            user_id: member.id,
            amount: parseFloat(share.toFixed(2)),
          }));
        } else {
          // Custom split
          expenseData.splits = includedMembers.map(member => ({
            user_id: member.id,
            amount: parseFloat(customAmounts[member.id] || '0'),
          }));
        }
      }
      
      await api.post('/expenses', expenseData);
      
      // Navigate back with a success flag
      navigation.navigate('Expenses', { refresh: true });
      
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create expense. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Expense</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Group Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group (optional)</Text>
          <TouchableOpacity 
            style={styles.groupSelector}
            onPress={() => setShowGroupPicker(true)}
          >
            <Text 
              style={[
                styles.groupSelectorText, 
                !selectedGroup && styles.groupSelectorPlaceholder,
                selectedGroup && styles.groupSelectorSelected
              ]}
            >
              {selectedGroup ? selectedGroup.name : 'Select a group'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={selectedGroup ? "#2e7d32" : "#95a5a6"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="e.g., Dinner, Groceries, Movie tickets"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
        
        {/* Amount */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount (₹)</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              placeholder="0.00"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              style={styles.amountInput}
              returnKeyType="next"
            />
          </View>
        </View>
        
        {/* Expense Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.typeContainer}>
            {expenseTypes.map((expenseType) => (
              <TouchableOpacity
                key={expenseType}
                style={[
                  styles.typeButton,
                  type === expenseType && styles.typeButtonSelected
                ]}
                onPress={() => setType(expenseType)}
              >
                <Text 
                  style={[
                    styles.typeButtonText,
                    type === expenseType && styles.typeButtonTextSelected
                  ]}
                >
                  {expenseType}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity 
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{date.toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>
        
        {/* Split Type */}
        {selectedGroup && members.length > 0 && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Split Type</Text>
            <View style={styles.splitTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.splitTypeButton,
                  splitType === 'equal' && styles.splitTypeButtonSelected
                ]}
                onPress={() => setSplitType('equal')}
              >
                <Text 
                  style={[
                    styles.splitTypeText,
                    splitType === 'equal' && { color: '#2e7d32', fontWeight: '600' }
                  ]}
                >
                  Equal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.splitTypeButton,
                  splitType === 'custom' && styles.splitTypeButtonSelected
                ]}
                onPress={() => setSplitType('custom')}
              >
                <Text 
                  style={[
                    styles.splitTypeText,
                    splitType === 'custom' && { color: '#2e7d32', fontWeight: '600' }
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Members List */}
        {selectedGroup && members.length > 0 && (
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>
              {splitType === 'equal' 
                ? `Each person pays ₹${calculateEqualSplit()}`
                : 'Enter amounts for each person'}
            </Text>
            
            {members.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                amount={splitType === 'equal' 
                  ? calculateEqualSplit() 
                  : customAmounts[member.id] || ''}
                onAmountChange={handleAmountChange}
                onToggle={toggleMember}
                isIncluded={member.isIncluded}
              />
            ))}
          </View>
        )}
        
        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && { opacity: 0.7 }]}
          onPress={submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {selectedGroup ? 'Add Expense to Group' : 'Add Expense'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      
      {/* Group Picker Modal */}
      <Modal
        visible={showGroupPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Group</Text>
              <TouchableOpacity onPress={() => setShowGroupPicker(false)}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.groupItem,
                    selectedGroup?.id === item.id && styles.groupItemSelected
                  ]}
                  onPress={() => handleGroupSelect(item)}
                >
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupMembers}>
                    {item.member_count || 0} members
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.loadingContainer}>
                  <Text style={{ color: '#6c757d' }}>No groups found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
