// app/admin/signup/index.tsx

import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AdminSignupScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [usernameFeedback, setUsernameFeedback] = useState<string>('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 1) {
      setUsernameFeedback('');
      setIsUsernameAvailable(false);
      return;
    }

    try {
      const response = await fetch(`https://intern-task-h2vr.onrender.com/api/v1/admin/check-username/${username}`);
      const result = await response.json();

      if (result.status === 'success' && result.data.isAvailable) {
        setUsernameFeedback('Username is available!');
        setIsUsernameAvailable(true);
      } else {
        setUsernameFeedback('Username is already taken!');
        setIsUsernameAvailable(false);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameFeedback('Error checking username!');
      setIsUsernameAvailable(false);
    }
  };

  // Handle form submission
  const handleSignup = async () => {
    if (!isUsernameAvailable) {
      Alert.alert('Error', 'Username is not available!');
      return;
    }
  
    if (password !== passwordConfirm) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch('https://psbackend-cyk4.onrender.com/api/v1/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, passwordConfirm }),
      });
  
      const result = await response.json();
      console.log(result);
      if (result.status === 'success') {
        // Store JWT token if available
        if (result.data.token) {
          await AsyncStorage.setItem('adminToken', result.data.token);
        }
        Alert.alert('Success', 'Signup successful!');
        router.push('/admin/login'); // Navigate to login
      } else {
        Alert.alert('Error', result.message || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      Alert.alert('Error', 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Choose a unique username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          checkUsernameAvailability(text);
        }}
      />
      <Text style={isUsernameAvailable ? styles.feedbackSuccess : styles.feedbackError}>
        {usernameFeedback}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        secureTextEntry
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
      />

      <Button
        title={loading ? 'Signing Up...' : 'Sign Up'}
        onPress={handleSignup}
        disabled={loading || !isUsernameAvailable || password.length === 0 || passwordConfirm.length === 0}
      />

      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => router.push('/admin/login')}>
          Log in here
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  feedbackSuccess: {
    color: 'green',
    marginBottom: 12,
  },
  feedbackError: {
    color: 'red',
    marginBottom: 12,
  },
  loginText: {
    marginTop: 12,
  },
  link: {
    color: 'blue',
  },
});

export default AdminSignupScreen;
