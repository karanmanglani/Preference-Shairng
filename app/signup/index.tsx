import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

type FormData = {
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  passwordConfirm: string;
  emailPermission: string;
  phonePermission: string;
  addressPermission: string;
};

const SignUpScreen = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState<boolean>(true);
  const [emailPermission, setEmailPermission] = useState<boolean>(false);
  const [phonePermission, setPhonePermission] = useState<boolean>(false);
  const [addressPermission, setAddressPermission] = useState<boolean>(false);

  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');  // Added Name state
  const [email, setEmail] = useState<string>('');  // Added Email state
  const [phone, setPhone] = useState<string>('');  // Added Phone state
  const [address, setAddress] = useState<string>('');  // Added Address state
  const [usernameFeedback, setUsernameFeedback] = useState<string>('');
  const [usernameFeedbackColor, setUsernameFeedbackColor] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);
  const [responseMessage, setResponseMessage] = useState<string>(''); // State to hold the response message

  // Debounce username availability check
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (username.length >= 1) {
        checkUsernameAvailability();
      }
    }, 500); // Delay by 500ms

    return () => clearTimeout(debounceTimer); // Clean up the timer on re-render
  }, [username]);

  const checkUsernameAvailability = async () => {
    try {
      // Make the fetch request to the backend API
      const response = await fetch('https://intern-task-h2vr.onrender.com/api/v1/users/check-username/' + username);
      
      // Parse the response JSON
      const result = await response.json();
  
      // Check if the status is 'success' and the 'isAvailable' field in the data is true
      if (result.status === 'success' && result.data.isAvailable) {
        setUsernameFeedback('Username is available!');
        setUsernameFeedbackColor('green');
        setIsSubmitDisabled(false); // Enable the submit button if username is available
      } else {
        setUsernameFeedback('Username is already taken!');
        setUsernameFeedbackColor('red');
        setIsSubmitDisabled(true); // Disable the submit button if username is not available
      }
    } catch (error) {
      // Log and handle errors if the fetch fails
      console.error('Error checking username:', error);
      setUsernameFeedback('Error checking username!');
      setUsernameFeedbackColor('red');
      setIsSubmitDisabled(true); // Disable the submit button in case of an error
    }
  };

  const handleConfirmPreferences = () => {
    setModalVisible(false);
  };

  const validatePassword = (password: string) => {
    const passwordLengthRegex = /^.{8,}$/;  // This regex checks if the password is at least 8 characters long
    return passwordLengthRegex.test(password);
  };

  const handleSubmit = async () => {
    if (password !== passwordConfirm) {
      Alert.alert('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Password must be at least 8 characters long');
      return;
    }

    const formData: FormData = {
      username,
      name,
      email,
      phone,
      address,
      password,
      passwordConfirm,
      emailPermission: emailPermission ? 'true' : 'false',  // Send permission as string
      phonePermission: phonePermission ? 'true' : 'false',  // Send permission as string
      addressPermission: addressPermission ? 'true' : 'false',  // Send permission as string
    };

    try {
      const response = await fetch('https://psbackend-cyk4.onrender.com/api/v1/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log(result);

      if (result.status === 'success') {
        await AsyncStorage.setItem('jwt', result.data.jwt);
        router.replace('/overview');
        setResponseMessage('Signup successful!'); // Update the response message on success
      } else {
        setResponseMessage(result.message || 'Something went wrong!'); // Update the response message on failure
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('An error occurred during sign-up');
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal for Permissions */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Permissions</Text>
          <Text>Please provide your preferences for sharing the following information:</Text>

          <View style={styles.formGroup}>
            <Text>Allow Email Sharing:</Text>
            <TouchableOpacity onPress={() => setEmailPermission(!emailPermission)}>
              <Text style={{ color: emailPermission ? 'green' : 'red' }}>
                {emailPermission ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text>Allow Phone Sharing:</Text>
            <TouchableOpacity onPress={() => setPhonePermission(!phonePermission)}>
              <Text style={{ color: phonePermission ? 'green' : 'red' }}>
                {phonePermission ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text>Allow Address Sharing:</Text>
            <TouchableOpacity onPress={() => setAddressPermission(!addressPermission)}>
              <Text style={{ color: addressPermission ? 'green' : 'red' }}>
                {addressPermission ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button title="Confirm Preferences" onPress={handleConfirmPreferences} />
        </View>
      </Modal>

      {/* Sign Up Form */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={{ color: usernameFeedbackColor }}>{usernameFeedback}</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />

        <Button title="Sign Up" onPress={handleSubmit} disabled={isSubmitDisabled} />
        
        {/* Display the response message */}
        {responseMessage ? <Text style={styles.responseText}>{responseMessage}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  responseText: {
    marginTop: 10,
    color: 'green',
    fontSize: 16,
  },
});

export default SignUpScreen;
