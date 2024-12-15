import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string; // Added new field to hold _id
  permissions: {
    email: boolean;
    phone: boolean;
    address: boolean;
  };
}

const PreferencesScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [isAddressChecked, setIsAddressChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let token = await AsyncStorage.getItem('jwt');
        if (token) {
          token = token.trim();
          if (!token.startsWith("Bearer ")) {
            token = `Bearer ${token}`;
          }

          const response = await fetch('https://intern-task-h2vr.onrender.com/api/v1/users/me', {
            method: 'GET',
            headers: {
              Authorization: token,
            },
          });
          const result = await response.json();

          if (response.ok && result.data?.data) {
            const userData = result.data.data;
            userData.id = userData._id; // Copy _id to id for convenience
            const permissions = userData.permissions;
            setUser(userData);
            setIsEmailChecked(permissions?.email || false);
            setIsPhoneChecked(permissions?.phone || false);
            setIsAddressChecked(permissions?.address || false);
          } else {
            setAlert(result.message || 'Failed to load user data');
          }
        } else {
          setAlert('User is not logged in.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setAlert('An error occurred while fetching user data.');
      }
    };

    fetchUserData();
  }, []);

  const handleSwitchChange = (field: string, value: boolean) => {
    if (value) {
      openModal(field);
    } else {
      removePermission(field);
    }
  };

  const openModal = (field: string) => {
    setCurrentField(field);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setErrorMessage(null);
    setInputValue('');
  };

  const removePermission = async (field: string) => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }

    try {
      let token = await AsyncStorage.getItem('jwt');
      if (token) {
        token = token.trim();
        if (!token.startsWith("Bearer ")) {
          token = `Bearer ${token}`;
        }

        const response = await fetch(
          `https://intern-task-h2vr.onrender.com/delete-${field}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
            body: JSON.stringify({ userId: user.id }), // Send userId
          }
        );

        const result = await response.json();

        if (response.ok) {
          Alert.alert(`${field} permission removed successfully.`);
        } else {
          Alert.alert(`Failed to remove ${field} permission.`);
        }
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error(`Error removing ${field} permission:`, error);
    }
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setErrorMessage(`Please enter a valid ${currentField}.`);
      return;
    }

    if (currentField === 'email' && !/\S+@\S+\.\S+/.test(inputValue)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!user?.id) {
      console.error('User ID not available');
      return;
    }

    try {
      let token = await AsyncStorage.getItem('jwt');
      if (token) {
        token = token.trim();
        if (!token.startsWith("Bearer ")) {
          token = `Bearer ${token}`;
        }

        const response = await fetch(
          `https://intern-task-h2vr.onrender.com/update-${currentField}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
            body: JSON.stringify({ userId: user.id, value: inputValue.trim() }), // Include userId
          }
        );

        const result = await response.json();

        if (response.ok) {
          Alert.alert(`${currentField} updated successfully!`);
        } else {
          Alert.alert(`Failed to update ${currentField}.`);
        }
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error(`Error updating ${currentField}:`, error);
    }

    closeModal();
  };

  if (!user) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {alert && <Text style={styles.alert}>{alert}</Text>}
      <Text style={styles.title}>Update Your Preferences</Text>

      <View style={styles.preferenceItem}>
        <Text>Allow Email Sharing:</Text>
        <Switch
          value={isEmailChecked}
          onValueChange={(value) => handleSwitchChange('email', value)}
        />
      </View>
      <View style={styles.preferenceItem}>
        <Text>Allow Phone Number Sharing:</Text>
        <Switch
          value={isPhoneChecked}
          onValueChange={(value) => handleSwitchChange('phone', value)}
        />
      </View>
      <View style={styles.preferenceItem}>
        <Text>Allow Address Sharing:</Text>
        <Switch
          value={isAddressChecked}
          onValueChange={(value) => handleSwitchChange('address', value)}
        />
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Please provide the required information</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter your ${currentField}`}
              value={inputValue}
              onChangeText={setInputValue}
            />
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            <Button title="Save" onPress={handleSave} />
            <Button title="Close" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alert: {
    color: 'red',
    marginBottom: 15,
  },
  preferenceItem: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default PreferencesScreen;
