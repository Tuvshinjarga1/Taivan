"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Droplet, PlusCircle, ArrowLeft, RefreshCw } from "react-native-feather"
import { useNavigation } from "@react-navigation/native"
import { useHealthData } from "../contexts/HealthDataContext"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { Picker } from "@react-native-picker/picker"

const screenWidth = Dimensions.get("window").width

export default function GlucoseTrackerScreen() {
  const navigation = useNavigation()
  const { glucoseReadings, saveGlucoseReading, getGlucoseReadings } = useHealthData()

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [glucoseValue, setGlucoseValue] = useState("")
  const [readingType, setReadingType] = useState("random")
  const [notes, setNotes] = useState("")
  const [timeRange, setTimeRange] = useState("7")

  useEffect(() => {
    loadGlucoseData()
  }, [timeRange])

  const loadGlucoseData = async () => {
    setIsLoading(true)
    try {
      await getGlucoseReadings(Number.parseInt(timeRange))
    } catch (error) {
      console.error("Error loading glucose data:", error)
      Alert.alert("Алдаа", "Сахарын хэмжилтийн мэдээллийг ачаалахад алдаа гарлаа.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGlucoseReading = async () => {
    if (!glucoseValue) {
      Alert.alert("Анхааруулга", "Сахарын хэмжээг оруулна уу.")
      return
    }

    const value = Number.parseFloat(glucoseValue)
    if (isNaN(value) || value <= 0) {
      Alert.alert("Анхааруулга", "Сахарын хэмжээ нь эерэг тоо байх ёстой.")
      return
    }

    setIsSubmitting(true)
    try {
      await saveGlucoseReading({
        value,
        readingType: readingType as any,
        timestamp: new Date(),
        notes,
      })

      // Reset form
      setGlucoseValue("")
      setReadingType("random")
      setNotes("")

      Alert.alert("Амжилттай", "Сахарын хэмжилт амжилттай хадгалагдлаа.")
    } catch (error) {
      console.error("Error saving glucose reading:", error)
      Alert.alert("Алдаа", "Сахарын хэмжилтийг хадгалахад алдаа гарлаа.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to get glucose status
  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { status: "low", label: "Бага", color: "#3b82f6" }
    if (value <= 140) return { status: "normal", label: "Хэвийн", color: "#22c55e" }
    if (value <= 180) return { status: "elevated", label: "Өндөр", color: "#eab308" }
    return { status: "high", label: "Маш өндөр", color: "#ef4444" }
  }

  // Calculate statistics
  const calculateStats = () => {
    if (glucoseReadings.length === 0) {
      return { average: 0, max: 0, min: 0 }
    }

    const sum = glucoseReadings.reduce((acc, reading) => acc + reading.value, 0)
    const average = Math.round(sum / glucoseReadings.length)
    const max = Math.max(...glucoseReadings.map((reading) => reading.value))
    const min = Math.min(...glucoseReadings.map((reading) => reading.value))

    return { average, max, min }
  }

  const stats = calculateStats()

  // Prepare chart data
  const prepareChartData = () => {
    if (glucoseReadings.length === 0) {
      return {
        labels: ["Өгөгдөл байхгүй"],
        datasets: [{ data: [0] }],
      }
    }

    // Sort readings by date
    const sortedReadings = [...glucoseReadings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    // Take only the last 7 readings for the chart
    const chartReadings = sortedReadings.slice(-7)

    return {
      labels: chartReadings.map((reading) =>
        new Date(reading.timestamp).toLocaleDateString("mn-MN", { month: "short", day: "numeric" }),
      ),
      datasets: [
        {
          data: chartReadings.map((reading) => reading.value),
          color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`, // Purple color
          strokeWidth: 2,
        },
        // Reference lines for normal range
        {
          data: Array(chartReadings.length).fill(70),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity * 0.5})`, // Blue
          strokeWidth: 1,
          withDots: false,
        },
        {
          data: Array(chartReadings.length).fill(140),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity * 0.5})`, // Green
          strokeWidth: 1,
          withDots: false,
        },
      ],
    }
  }

  const chartData = prepareChartData()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft stroke="#1f2937" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Сахарын хэмжилт</Text>
        <TouchableOpacity onPress={() => navigation.navigate("GlucoseHistory")}>
          <Text style={styles.historyLink}>Түүх</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Дундаж</Text>
            <Text style={styles.statValue}>{stats.average}</Text>
            <Text style={styles.statUnit}>мг/дл</Text>
            <View style={[styles.statusBadge, { backgroundColor: getGlucoseStatus(stats.average).color + "20" }]}>
              <Text style={[styles.statusText, { color: getGlucoseStatus(stats.average).color }]}>
                {getGlucoseStatus(stats.average).label}
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Хамгийн их</Text>
            <Text style={styles.statValue}>{stats.max}</Text>
            <Text style={styles.statUnit}>мг/дл</Text>
            <View style={[styles.statusBadge, { backgroundColor: getGlucoseStatus(stats.max).color + "20" }]}>
              <Text style={[styles.statusText, { color: getGlucoseStatus(stats.max).color }]}>
                {getGlucoseStatus(stats.max).label}
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Хамгийн бага</Text>
            <Text style={styles.statValue}>{stats.min}</Text>
            <Text style={styles.statUnit}>мг/дл</Text>
            <View style={[styles.statusBadge, { backgroundColor: getGlucoseStatus(stats.min).color + "20" }]}>
              <Text style={[styles.statusText, { color: getGlucoseStatus(stats.min).color }]}>
                {getGlucoseStatus(stats.min).label}
              </Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Сахарын түвшний түүх</Text>
            <View style={styles.timeRangeSelector}>
              <Picker
                selectedValue={timeRange}
                style={styles.picker}
                onValueChange={(itemValue) => setTimeRange(itemValue)}
              >
                <Picker.Item label="7 өдөр" value="7" />
                <Picker.Item label="14 өдөр" value="14" />
                <Picker.Item label="30 өдөр" value="30" />
              </Picker>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
          ) : (
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#6366f1",
                },
              }}
              bezier
              style={styles.chart}
            />
          )}
        </View>

        {/* Add New Reading Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Шинэ хэмжилт нэмэх</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Сахарын хэмжээ (мг/дл)</Text>
            <TextInput
              style={styles.input}
              value={glucoseValue}
              onChangeText={setGlucoseValue}
              keyboardType="numeric"
              placeholder="Жишээ: 120"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Хэмжилтийн төрөл</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={readingType}
                style={styles.picker}
                onValueChange={(itemValue) => setReadingType(itemValue)}
              >
                <Picker.Item label="Өлөн үед" value="fasting" />
                <Picker.Item label="Хоолны өмнө" value="before_meal" />
                <Picker.Item label="Хоолны дараа" value="after_meal" />
                <Picker.Item label="Унтахын өмнө" value="bedtime" />
                <Picker.Item label="Санамсаргүй" value="random" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Тэмдэглэл (заавал биш)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Жишээ: Өглөөний цай уусны дараа"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleAddGlucoseReading} disabled={isSubmitting}>
            {isSubmitting ? (
              <View style={styles.buttonContent}>
                <RefreshCw stroke="#ffffff" width={20} height={20} style={styles.spinningIcon} />
                <Text style={styles.buttonText}>Хадгалж байна...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <PlusCircle stroke="#ffffff" width={20} height={20} />
                <Text style={styles.buttonText}>Хэмжилт нэмэх</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Readings */}
        <View style={styles.recentReadingsCard}>
          <Text style={styles.recentReadingsTitle}>Сүүлийн хэмжилтүүд</Text>

          {glucoseReadings.length > 0 ? (
            glucoseReadings.slice(0, 3).map((reading, index) => (
              <View key={reading.id || index} style={styles.readingItem}>
                <View style={[styles.readingIcon, { backgroundColor: getGlucoseStatus(reading.value).color + "20" }]}>
                  <Droplet stroke={getGlucoseStatus(reading.value).color} width={20} height={20} />
                </View>

                <View style={styles.readingContent}>
                  <View style={styles.readingHeader}>
                    <Text style={styles.readingValue}>{reading.value} мг/дл</Text>
                    <View
                      style={[styles.statusBadge, { backgroundColor: getGlucoseStatus(reading.value).color + "20" }]}
                    >
                      <Text style={[styles.statusText, { color: getGlucoseStatus(reading.value).color }]}>
                        {getGlucoseStatus(reading.value).label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.readingTime}>
                    {new Date(reading.timestamp).toLocaleString("mn-MN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {reading.readingType === "fasting"
                      ? "Өлөн үед"
                      : reading.readingType === "before_meal"
                        ? "Хоолны өмнө"
                        : reading.readingType === "after_meal"
                          ? "Хоолны дараа"
                          : reading.readingType === "bedtime"
                            ? "Унтахын өмнө"
                            : "Санамсаргүй"}
                  </Text>

                  {reading.notes && <Text style={styles.readingNotes}>{reading.notes}</Text>}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyState}>Сахарын хэмжилтийн түүх байхгүй байна</Text>
          )}

          {glucoseReadings.length > 3 && (
            <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("GlucoseHistory")}>
              <Text style={styles.viewAllText}>Бүх хэмжилтүүдийг харах</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
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
  historyLink: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statUnit: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  timeRangeSelector: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    width: 120,
  },
  picker: {
    height: 30,
    width: "100%",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loader: {
    marginVertical: 40,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  submitButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  spinningIcon: {
    transform: [{ rotate: "45deg" }],
  },
  recentReadingsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentReadingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  readingItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 12,
  },
  readingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  readingContent: {
    flex: 1,
  },
  readingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginRight: 8,
  },
  readingTime: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  readingNotes: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#6b7280",
  },
  emptyState: {
    textAlign: "center",
    color: "#6b7280",
    padding: 16,
  },
  viewAllButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "500",
  },
})
