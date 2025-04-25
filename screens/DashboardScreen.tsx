"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Heart,
  Droplet,
  Activity,
  Moon,
  Utensils,
  AlertTriangle,
  Info,
} from "react-native-feather";
import { useNavigation } from "@react-navigation/native";
import { useHealthData } from "../contexts/HealthDataContext";
import { useAuth } from "../contexts/AuthContext";
import HealthSummaryCard from "../components/HealthSummaryCard";
import HealthMetricCard from "../components/HealthMetricCard";
import GlucoseCard from "../components/GlucoseCard";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const {
    healthData,
    glucoseReadings,
    isLoading,
    getLatestHealthData,
    getGlucoseReadings,
  } = useHealthData();
  const { isDiabetic } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [latestGlucoseReading, setLatestGlucoseReading] = useState<any>(null);

  useEffect(() => {
    if (glucoseReadings.length > 0) {
      setLatestGlucoseReading(glucoseReadings[0]);
    }
  }, [glucoseReadings]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getLatestHealthData();
      await getGlucoseReadings(7);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get current date
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("mn-MN", dateOptions);

  // Function to get glucose status
  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { status: "low", label: "Бага", color: "#3b82f6" };
    if (value <= 140)
      return { status: "normal", label: "Хэвийн", color: "#22c55e" };
    if (value <= 180)
      return { status: "elevated", label: "Өндөр", color: "#eab308" };
    return { status: "high", label: "Маш өндөр", color: "#ef4444" };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Эрүүл мэндийн хяналт</Text>
          <Text style={styles.headerDate}>{formattedDate}</Text>
        </View>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate("Notifications")}
          >
            <View style={styles.notificationBadge} />
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={{ uri: "https://via.placeholder.com/40" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Health Summary */}
        {healthData && (
          <HealthSummaryCard
            heartRate={healthData.heartRate}
            steps={healthData.steps}
            sleep={healthData.sleep}
            calories={healthData.calories}
          />
        )}

        {/* Glucose Reading Card (if diabetic) */}
        {isDiabetic && latestGlucoseReading && (
          <GlucoseCard
            value={latestGlucoseReading.value}
            timestamp={latestGlucoseReading.timestamp}
            status={getGlucoseStatus(latestGlucoseReading.value)}
            onPress={() => navigation.navigate("GlucoseTracker")}
          />
        )}

        {/* Health Metrics */}
        <View style={styles.metricsContainer}>
          <HealthMetricCard
            title="Зүрхний цохилт"
            value={healthData?.heartRate || 0}
            unit="bpm"
            icon={<Heart stroke="#ef4444" width={24} height={24} />}
            backgroundColor="#fef2f2"
            onPress={() => navigation.navigate("HeartRateDetails")}
          />

          <HealthMetricCard
            title="Алхалт"
            value={healthData?.steps || 0}
            unit="алхам"
            icon={<Activity stroke="#3b82f6" width={24} height={24} />}
            backgroundColor="#eff6ff"
            onPress={() => navigation.navigate("StepsDetails")}
          />

          <HealthMetricCard
            title="Нойр"
            value={healthData?.sleep || 0}
            unit="цаг"
            icon={<Moon stroke="#8b5cf6" width={24} height={24} />}
            backgroundColor="#f5f3ff"
            onPress={() => navigation.navigate("SleepDetails")}
          />

          <HealthMetricCard
            title="Калори"
            value={healthData?.calories || 0}
            unit="ккал"
            icon={<Activity stroke="#22c55e" width={24} height={24} />}
            backgroundColor="#f0fdf4"
            onPress={() => navigation.navigate("CaloriesDetails")}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Үйлдлүүд</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("FoodAnalyzer")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#fff7ed" }]}>
              <Utensils stroke="#f97316" width={24} height={24} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Хоолны калори тооцоолуур</Text>
              <Text style={styles.actionDescription}>
                Хоолны зургаас калори тооцоолох
              </Text>
            </View>
          </TouchableOpacity>

          {isDiabetic && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("GlucoseTracker")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#faf5ff" }]}>
                <Droplet stroke="#a855f7" width={24} height={24} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Сахарын хэмжилт</Text>
                <Text style={styles.actionDescription}>
                  Сахарын түвшинг хянах
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("DiabetesAssessment")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#fef2f2" }]}>
              <AlertTriangle stroke="#ef4444" width={24} height={24} />
            </View>
            <View>
              <AlertTriangle stroke="#ef4444" width={24} height={24} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Чихрийн шижингийн эрсдэлийн үнэлгээ
              </Text>
              <Text style={styles.actionDescription}>
                Чихрийн шижин үүсэх эрсдэлээ шалгах
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("DiabetesInfo")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#faf5ff" }]}>
              <Info stroke="#8b5cf6" width={24} height={24} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Чихрийн шижингийн мэдээлэл</Text>
              <Text style={styles.actionDescription}>
                Мэдээлэл, зөвлөгөө, сануулга
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 12,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    zIndex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1f2937",
  },
  actionCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
});
