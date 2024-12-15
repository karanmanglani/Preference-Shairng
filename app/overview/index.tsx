// app/overview.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Import useRouter for navigation

// Define a type for the user data
interface User {
  permissions?: {
    email: boolean;
    phone: boolean;
    address: boolean;
  };
}

const OverviewScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const router = useRouter(); // Use useRouter hook for navigation

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve JWT from AsyncStorage
        let token = await AsyncStorage.getItem('jwt');
        console.log("Retrieved JWT Token:", token);  // Log the token to ensure it's correctly retrieved

        if (token) {
          token = token.trim();  // Ensure there are no leading/trailing spaces
          console.log("Sanitized JWT Token:", token);  // Log sanitized token

          // Add the "Bearer " prefix if it's not already there
          if (!token.startsWith("Bearer ")) {
            token = `Bearer ${token}`;
            console.log("Added Bearer prefix:", token);  // Log the token with Bearer prefix
          }

          // Log the final token to check if it's correct
          console.log("Final JWT Token being sent:", token);

          const response = await fetch('https://intern-task-h2vr.onrender.com/api/v1/users/me', {
            method: 'GET',
            headers: {
              'Authorization': token, // Pass the full token as it is
            },
          });

          const result = await response.json();
          console.log("Response from server:", result);  // Log the response for debugging

          if (response.ok) {
            setUser(result.data);  // Assuming the response contains the user data under 'data'
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

  const handleUpdatePreferences = () => {
    // Navigate to Preferences screen
    router.push('/preferences'); // Use router.push to navigate to the preferences page
  };

  if (!user) {
    return (
      <View style={styles.container}>
        {alert && <Text style={styles.alert}>{alert}</Text>}
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {alert && <Text style={styles.alert}>{alert}</Text>}
      <Text style={styles.title}>Your Preferences Overview</Text>
      <View style={styles.preferencesList}>
        <Text>Email Permission: 
          <Text style={user.permissions?.email ? styles.granted : styles.denied}>
            {user.permissions?.email ? ' Granted' : ' Denied'}
          </Text>
        </Text>
        <Text>Phone Permission: 
          <Text style={user.permissions?.phone ? styles.granted : styles.denied}>
            {user.permissions?.phone ? ' Granted' : ' Denied'}
          </Text>
        </Text>
        <Text>Address Permission: 
          <Text style={user.permissions?.address ? styles.granted : styles.denied}>
            {user.permissions?.address ? ' Granted' : ' Denied'}
          </Text>
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Update Your Preferences" onPress={handleUpdatePreferences} />
      </View>
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
  preferencesList: {
    marginBottom: 20,
  },
  granted: {
    color: 'green',
  },
  denied: {
    color: 'red',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default OverviewScreen;
