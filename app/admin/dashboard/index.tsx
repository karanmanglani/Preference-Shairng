import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

const AdminDashboardScreen: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch the stored JWT token for admin
  const fetchAdminToken = async () => {
    try {
      const token = await AsyncStorage.getItem("adminToken");
      return token;
    } catch (error) {
      console.error("Error fetching admin token:", error);
      return null;
    }
  };

  // Fetch users
  const fetchUsers = async (token: string | null) => {
    try {
      const response = await fetch(
        "https://psbackend-cyk4.onrender.com/api/v1/admin/users"
        // Uncomment the below lines when using Authorization token
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // }
      );
      const data = await response.json();
  
      if (data?.status === "success" && Array.isArray(data.data?.users)) {
        const usersWithUsernames = await Promise.all(
          data.data.users.map(async (user: any) => {
            const username = await fetchUsername(user._id); // Fetch username for each user
            return { ...user, username }; // Add username to user data
          })
        );
        setUsers(usersWithUsernames);
      } else {
        console.error("No users found or invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  

  // Fetch audit logs
  const fetchAuditLogs = async (token: string | null) => {
    try {
      const response = await fetch(
        "https://intern-task-h2vr.onrender.com/admin/audit-logs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const logs = await response.json();
      const logsWithCity = await Promise.all(
        logs.map(async (log: any) => {
          const city = await getCityFromIp(log.ipAddress); // Get city from IP
          const user = await fetchUsername(log.user)
          return { ...log, city,user };
        })
      );
      setAuditLogs(logsWithCity);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  // Fetch location data
  const fetchLocationData = async () => {
    try {
      const response = await fetch(
        "https://intern-task-h2vr.onrender.com/admin/user-ips"
      );
      const ipAddresses = await response.json();
      const locationCounts: Record<string, number> = {};

      const getLocationFromIp = async (ip: string) => {
        try {
          const res = await fetch(`https://freeipapi.com/api/json/${ip}`);
          const data = await res.json();
          return data.cityName === "-" ? "Unknown" : data.cityName;
        } catch (error) {
          console.error(`Error fetching location for IP ${ip}:`, error);
          return "Unknown";
        }
      };

      for (const ip of ipAddresses) {
        const location = await getLocationFromIp(ip);
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }

      const pieData = Object.entries(locationCounts).map(([key, value]) => ({
        name: key,
        count: value,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      }));

      setLocationData(pieData);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      const token = await fetchAdminToken();
      if (token) {
        await fetchUsers(token);
        await fetchAuditLogs(token);
        await fetchLocationData();
      } else {
        console.error("No admin token found. Redirecting to Admin Login.");
        router.push("/admin/login"); // Redirect to Admin Login
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchUsername = async (userId: string) => {
    try {
      const response = await fetch(
        `https://intern-task-h2vr.onrender.com/admin/get-username/${userId}`
      ); // Fetch username from userId
      const data = await response.json();
      return data.username;
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown"; // Fallback if error
    }
  };

  const getCityFromIp = async (ip: string) => {
    try {
      const res = await fetch(`https://freeipapi.com/api/json/${ip}`);
      const data = await res.json();
      return data.cityName === "-" ? "Unknown" : data.cityName;
    } catch (error) {
      console.error(`Error fetching location for IP ${ip}:`, error);
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Data Section */}
      <Text style={styles.header}>User Data</Text>
      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text>Username: {item.username}</Text>
              <Text>Name: {item.name}</Text>
              <Text>Email: {item.email || "N/A"}</Text>
              <Text>Phone (Encrypted): {item.phone || "N/A"}</Text>
              <Text>Address: {item.address || "N/A"}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No users found.</Text>
      )}

      {/* User Locations Pie Chart */}
      <Text style={styles.header}>User Locations</Text>
      <PieChart
        data={locationData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Audit Logs Section */}
      <Text style={styles.header}>Audit Logs</Text>
      <FlatList
        data={auditLogs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>User: {item.user}</Text>
            <Text>Location: {item.city || "Unknown"}</Text>
            <Text>Action: {item.action}</Text>
            <Text>Field: {item.field}</Text>
            <Text>
              Timestamp: {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  row: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AdminDashboardScreen;
