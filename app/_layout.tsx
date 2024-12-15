import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(false);
  const [admin, setAdmin] = useState(false);
  const router = useRouter();

  // Fetch user and admin state from AsyncStorage
  useEffect(() => {
    const fetchAuthState = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const adminToken = await AsyncStorage.getItem("adminToken");

        setUser(!!userToken); // Set to true if a user token exists
        setAdmin(!!adminToken); // Set to true if an admin token exists
      } catch (error) {
        console.error("Error retrieving auth state:", error);
      }
    };

    fetchAuthState();
  }, []);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preference Sharing App</Text>
        <View style={styles.nav}>
          {user ? (
            <>
              <Button title="Overview" onPress={() => router.push("/overview")} />
              <Button title="Update Preferences" onPress={() => router.push("/preferences")} />
            </>
          ) : (
            <>
              <Button title="Login" onPress={() => router.push("/login")} />
              <Button title="Signup" onPress={() => router.push("/signup")} />
            </>
          )}
          {admin ? (
            <>
              <Button title="Admin Dashboard" onPress={() => router.push("/admin/dashboard")} />
            </>
          ) : (
            <Button title="Admin Login" onPress={() => router.push("/admin/login")} />
          )}
        </View>
      </View>
      <View style={styles.content}>
        <Stack />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#007BFF",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#fff",
  },
  nav: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-around",
    width: "100%",
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
