import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from "expo-router";

const IndexScreen = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the Preference Sharing App</Text>

      <View style={styles.linkContainer}>
        <Text style={styles.link} onPress={() => router.replace('/signup')}>
          Sign up here
        </Text>

        <Text style={styles.link} onPress={() => router.replace('/login')}>
          Login Here
        </Text>
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
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
  linkContainer: {
    marginTop: 20,
  },
  link: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default IndexScreen;
