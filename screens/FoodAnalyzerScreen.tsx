"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Camera, Upload, RefreshCw, Save, ArrowLeft, AlertTriangle } from "react-native-feather"
import { useNavigation } from "@react-navigation/native"
import { useHealthData } from "../contexts/HealthDataContext"
import { useAuth } from "../contexts/AuthContext"
import * as ImagePicker from "expo-image-picker"
import { Picker } from "@react-native-picker/picker"
import { createTabs, Tab } from "../components/Tabs"

// Mock function to simulate AI analysis
const analyzeFoodImage = async (imageUri: string) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return mock data
  return {
    success: true,
    data: {
      foodItems: [
        {
          name: "Grilled Chicken Breast",
          portion: "4 oz (113g)",
          calories: 165,
          carbs: 0,
        },
        {
          name: "Brown Rice",
          portion: "1 cup (195g)",
          calories: 216,
          carbs: 45,
        },
        {
          name: "Steamed Broccoli",
          portion: "1 cup (91g)",
          calories: 55,
          carbs: 11,
        },
        {
          name: "Olive Oil",
          portion: "1 tsp (5ml)",
          calories: 40,
          carbs: 0,
        },
      ],
      totalCalories: 476,
      totalCarbs: 56,
    },
  }
}

export default function FoodAnalyzerScreen() {
  const navigation = useNavigation()
  const { saveFoodData } = useHealthData()
  const { isDiabetic } = useAuth()

  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("analyze")
  const [mealType, setMealType] = useState("lunch")
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  useEffect(() => {
    ;(async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Анхааруулга", "Камер ашиглах зөвшөөрөл байхгүй байна.")
        }
      }
    })()
  }, [])

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setAnalysisResult(null)
    }
  }

  const takePicture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setAnalysisResult(null)
    }
  }

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert("Анхааруулга", "Эхлээд зураг оруулна уу.")
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeFoodImage(image)

      if (result.success) {
        setAnalysisResult(result.data)
        setActiveTab("results")

        Alert.alert(
          "Шинжилгээ дууслаа",
          `${result.data.foodItems.length} хоолны зүйл илрүүлж, ойролцоогоор ${result.data.totalCalories} калори тодорхойлов.`,
        )
      } else {
        Alert.alert("Шинжилгээ амжилтгүй", result.error || "Хоолны зургийг шинжлэх боломжгүй байна. Дахин оролдоно уу.")
      }
    } catch (error) {
      console.error("Error analyzing food image:", error)
      Alert.alert("Алдаа", "Гэнэтийн алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveToHealthData = async () => {
    if (!analysisResult) return

    setIsSaving(true)
    try {
      await saveFoodData({
        foodItems: analysisResult.foodItems,
        totalCalories: analysisResult.totalCalories,
        totalCarbs: analysisResult.totalCarbs,
        mealType: mealType as any,
        userId: "user123", // This would come from auth context in a real app
      })

      Alert.alert("Амжилттай", `${analysisResult.totalCalories} калори таны эрүүл мэндийн мэдээлэлд нэмэгдлээ.`)

      // Reset the form
      setImage(null)
      setAnalysisResult(null)
      setActiveTab("analyze")
    } catch (error) {
      console.error("Error saving food data:", error)
      Alert.alert("Алдаа", "Хоолны мэдээллийг хадгалахад алдаа гарлаа.")
    } finally {
      setIsSaving(false)
    }
  }

  const { TabBar, TabView } = createTabs()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft stroke="#1f2937" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Хоолны калори тооцоолуур</Text>
        <View style={{ width: 24 }} />
      </View>

      {isDiabetic && (
        <View style={styles.warningBanner}>
          <AlertTriangle stroke="#f59e0b" width={20} height={20} />
          <Text style={styles.warningText}>
            Таны чихрийн шижингийн эрсдэлийн үнэлгээ өндөр байгаа тул нүүрс усны хэмжээг хянах горим идэвхжүүлэгдлээ.
          </Text>
        </View>
      )}

      <TabBar
        tabs={[
          { key: "analyze", title: "Шинжлэх", icon: Camera },
          { key: "results", title: "Үр дүн", icon: Upload, disabled: !analysisResult },
          { key: "recommendations", title: "Зөвлөмж", icon: AlertTriangle },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <TabView activeTab={activeTab} style={styles.tabContent}>
        <Tab name="analyze">
          <ScrollView>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Хоолны зураг шинжлэх</Text>
              <Text style={styles.cardDescription}>Хоолны калорийг тооцоолохын тулд зураг оруулна уу</Text>

              {image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Upload stroke="#9ca3af" width={32} height={32} />
                  <Text style={styles.placeholderText}>Дарж зураг оруулах эсвэл камер нээх</Text>
                  <Text style={styles.placeholderSubtext}>JPG, PNG эсвэл WEBP (хамгийн ихдээ 5MB)</Text>
                </View>
              )}

              <View style={styles.buttonGroup}>
                <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={pickImage}>
                  <Upload stroke="#6366f1" width={20} height={20} />
                  <Text style={styles.outlineButtonText}>Зураг оруулах</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={takePicture}>
                  <Camera stroke="#6366f1" width={20} height={20} />
                  <Text style={styles.outlineButtonText}>Зураг авах</Text>
                </TouchableOpacity>
              </View>

              {image && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Хоолны төрөл</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={mealType}
                        style={styles.picker}
                        onValueChange={(itemValue) => setMealType(itemValue)}
                      >
                        <Picker.Item label="Өглөөний хоол" value="breakfast" />
                        <Picker.Item label="Үдийн хоол" value="lunch" />
                        <Picker.Item label="Оройн хоол" value="dinner" />
                        <Picker.Item label="Завсрын зууш" value="snack" />
                      </Picker>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.primaryButton} onPress={analyzeImage} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <View style={styles.buttonContent}>
                        <RefreshCw stroke="#ffffff" width={20} height={20} style={styles.spinningIcon} />
                        <Text style={styles.primaryButtonText}>Шинжилж байна...</Text>
                      </View>
                    ) : (
                      <Text style={styles.primaryButtonText}>Хоолыг шинжлэх</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            {analysisResult && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Шинжилгээний үр дүн</Text>

                <View style={styles.resultContainer}>
                  <Text style={styles.resultSubtitle}>Илрүүлсэн хоолны зүйлс</Text>

                  {analysisResult.foodItems.map((item: any, index: number) => (
                    <View key={index} style={styles.foodItem}>
                      <View style={styles.foodItemHeader}>
                        <Text style={styles.foodItemName}>{item.name}</Text>
                        <Text style={styles.foodItemCalories}>{item.calories} кал</Text>
                      </View>
                      <View style={styles.foodItemDetails}>
                        <Text style={styles.foodItemPortion}>{item.portion}</Text>
                        {isDiabetic && item.carbs !== undefined && (
                          <Text style={styles.foodItemCarbs}>{item.carbs} г нүүрс ус</Text>
                        )}
                      </View>
                    </View>
                  ))}

                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Нийт калори</Text>
                    <Text style={styles.totalValue}>{analysisResult.totalCalories} кал</Text>
                  </View>

                  {isDiabetic && analysisResult.totalCarbs !== undefined && (
                    <View style={styles.totalContainer}>
                      <Text style={[styles.totalLabel, styles.carbsLabel]}>Нийт нүүрс ус</Text>
                      <Text style={[styles.totalValue, styles.carbsValue]}>{analysisResult.totalCarbs} г</Text>
                    </View>
                  )}
                </View>

                {isDiabetic && analysisResult.totalCarbs > 30 && (
                  <View style={styles.warningContainer}>
                    <AlertTriangle stroke="#f59e0b" width={20} height={20} />
                    <Text style={styles.warningMessage}>
                      Энэ хоолонд нүүрс ус өндөр байна. Хэмжээг багасгахыг зөвлөж байна.
                    </Text>
                  </View>
                )}

                <TouchableOpacity style={styles.primaryButton} onPress={saveToHealthData} disabled={isSaving}>
                  {isSaving ? (
                    <View style={styles.buttonContent}>
                      <RefreshCw stroke="#ffffff" width={20} height={20} style={styles.spinningIcon} />
                      <Text style={styles.primaryButtonText}>Хадгалж байна...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Save stroke="#ffffff" width={20} height={20} />
                      <Text style={styles.primaryButtonText}>Эрүүл мэндийн мэдээлэлд хадгалах</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Tab>

        <Tab name="results">
          {analysisResult && (
            <ScrollView>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Хоолны дэлгэрэнгүй мэдээлэл</Text>
                <Text style={styles.cardDescription}>
                  {mealType === "breakfast"
                    ? "Өглөөний хоол"
                    : mealType === "lunch"
                      ? "Үдийн хоол"
                      : mealType === "dinner"
                        ? "Оройн хоол"
                        : "Завсрын зууш"}
                </Text>

                {image && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                  </View>
                )}

                <View style={styles.statsGrid}>
                  <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Калорийн мэдээлэл</Text>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Нийт калори:</Text>
                      <Text style={styles.statValue}>{analysisResult.totalCalories} кал</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Өдрийн хэрэгцээний:</Text>
                      <Text style={styles.statValue}>{Math.round((analysisResult.totalCalories / 2000) * 100)}%</Text>
                    </View>
                    {isDiabetic && analysisResult.totalCarbs !== undefined && (
                      <View style={styles.statRow}>
                        <Text style={[styles.statLabel, styles.carbsLabel]}>Нийт нүүрс ус:</Text>
                        <Text style={[styles.statValue, styles.carbsValue]}>{analysisResult.totalCarbs} г</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Хоолны төрөл</Text>
                    <View style={styles.foodTypeContainer}>
                      {analysisResult.foodItems.map((item: any, index: number) => (
                        <View key={index} style={styles.foodTypeTag}>
                          <Text style={styles.foodTypeText}>{item.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <Text style={styles.detailsTitle}>Хоолны зүйлсийн дэлгэрэнгүй</Text>

                {analysisResult.foodItems.map((item: any, index: number) => (
                  <View key={index} style={styles.detailedFoodItem}>
                    <View style={styles.detailedFoodHeader}>
                      <Text style={styles.detailedFoodName}>{item.name}</Text>
                      <Text style={styles.detailedFoodCalories}>{item.calories} кал</Text>
                    </View>
                    <View style={styles.detailedFoodDetails}>
                      <Text style={styles.detailedFoodPortion}>{item.portion}</Text>
                      {isDiabetic && item.carbs !== undefined && (
                        <Text style={styles.detailedFoodCarbs}>{item.carbs} г нүүрс ус</Text>
                      )}
                    </View>
                  </View>
                ))}

                {isDiabetic && analysisResult.totalCarbs > 30 && (
                  <View style={styles.warningContainer}>
                    <AlertTriangle stroke="#f59e0b" width={20} height={20} />
                    <Text style={styles.warningMessage}>
                      Энэ хоолонд нүүрс ус өндөр байна. Хэмжээг багасгахыг зөвлөж байна.
                    </Text>
                  </View>
                )}

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.button, styles.outlineButton]}
                    onPress={() => setActiveTab("analyze")}
                  >
                    <Text style={styles.outlineButtonText}>Шинэ хоол шинжлэх</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton, { flex: 1 }]}
                    onPress={saveToHealthData}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Text style={styles.primaryButtonText}>Хадгалж байна...</Text>
                    ) : (
                      <Text style={styles.primaryButtonText}>Хадгалах</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </Tab>

        <Tab name="recommendations">
          <ScrollView>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Хооллолтын зөвлөмж</Text>
              <Text style={styles.cardDescription}>Эрүүл хооллолтын талаарх зөвлөмжүүд</Text>

              {isDiabetic ? (
                <View style={styles.recommendationsContainer}>
                  <View style={styles.warningContainer}>
                    <AlertTriangle stroke="#f59e0b" width={20} height={20} />
                    <Text style={styles.warningMessage}>
                      Таны чихрийн шижингийн эрсдэлийн үнэлгээ өндөр байгаа тул дараах зөвлөмжүүдийг анхаарна уу.
                    </Text>
                  </View>

                  <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationTitle}>Нүүрс усны хязгаарлалт</Text>
                    <Text style={styles.recommendationText}>
                      Чихрийн шижингийн эрсдэлтэй хүмүүс нүүрс усны хэрэглээгээ хянах шаардлагатай. Дараах зөвлөмжүүдийг
                      дагана уу:
                    </Text>
                    <View style={styles.recommendationList}>
                      <Text style={styles.recommendationItem}>
                        • Нэг удаагийн хоолонд 45-60 грамм нүүрс ус хэрэглэхийг зөвлөдөг
                      </Text>
                      <Text style={styles.recommendationItem}>• Завсрын зууш 15-30 грамм нүүрс устай байх</Text>
                      <Text style={styles.recommendationItem}>
                        • Өдөрт нийт 130-180 грамм нүүрс ус хэрэглэхийг зөвлөдөг
                      </Text>
                      <Text style={styles.recommendationItem}>
                        • Цагаан гурил, цагаан будаа, чихэр зэрэг энгийн нүүрс усыг хязгаарлах
                      </Text>
                      <Text style={styles.recommendationItem}>
                        • Бүхэл үр тариа, хүнсний ногоо, жимс зэрэг нарийн ширхэгтэй хүнс хэрэглэх
                      </Text>
                    </View>
                  </View>

                  <View style={styles.recommendationGrid}>
                    <View style={styles.recommendationCard}>
                      <Text style={styles.recommendationCardTitle}>Зөвлөж буй хүнс</Text>
                      <View style={styles.recommendationList}>
                        <Text style={styles.recommendationItem}>• Ногоон навчит ногоо (салат, шпинат)</Text>
                        <Text style={styles.recommendationItem}>• Бүхэл үрийн талх, бор будаа</Text>
                        <Text style={styles.recommendationItem}>• Өөх тос багатай уураг (тахиа, загас)</Text>
                        <Text style={styles.recommendationItem}>• Жимсгэнэ, алим, лийр (хэмжээг хянах)</Text>
                        <Text style={styles.recommendationItem}>• Самар, үр (хэмжээг хянах)</Text>
                      </View>
                    </View>

                    <View style={styles.recommendationCard}>
                      <Text style={styles.recommendationCardTitle}>Хязгаарлах хүнс</Text>
                      <View style={styles.recommendationList}>
                        <Text style={styles.recommendationItem}>• Цагаан гурил, цагаан будаа</Text>
                        <Text style={styles.recommendationItem}>• Чихэр, жигнэмэг, бялуу</Text>
                        <Text style={styles.recommendationItem}>• Чихэрлэг ундаа, жүүс</Text>
                        <Text style={styles.recommendationItem}>• Боловсруулсан хүнс</Text>
                        <Text style={styles.recommendationItem}>• Шарсан хүнс</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("DiabetesInfo")}>
                    <Text style={styles.primaryButtonText}>Чихрийн шижингийн талаар дэлгэрэнгүй мэдээлэл авах</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.recommendationsContainer}>
                  <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationTitle}>Эрүүл хооллолтын зарчмууд</Text>
                    <Text style={styles.recommendationText}>
                      Эрүүл хооллолт нь таны биеийн ерөнхий эрүүл мэндэд чухал үүрэгтэй. Дараах зөвлөмжүүдийг дагана уу:
                    </Text>
                    <View style={styles.recommendationList}>
                      <Text style={styles.recommendationItem}>
                        • Өдөрт 5-аас доошгүй төрлийн жимс, хүнсний ногоо хэрэглэх
                      </Text>
                      <Text style={styles.recommendationItem}>• Бүхэл үр тариа хэрэглэх</Text>
                      <Text style={styles.recommendationItem}>• Өөх тос багатай уураг хэрэглэх</Text>
                      <Text style={styles.recommendationItem}>• Сахар, давс, өөх тосыг хязгаарлах</Text>
                      <Text style={styles.recommendationItem}>• Хангалттай хэмжээний ус уух (өдөрт 8 аяга)</Text>
                    </View>
                  </View>

                  <View style={styles.recommendationGrid}>
                    <View style={styles.recommendationCard}>
                      <Text style={styles.recommendationCardTitle}>Зөвлөж буй хүнс</Text>
                      <View style={styles.recommendationList}>
                        <Text style={styles.recommendationItem}>• Жимс, хүнсний ногоо</Text>
                        <Text style={styles.recommendationItem}>• Бүхэл үрийн талх, гурил</Text>
                        <Text style={styles.recommendationItem}>• Өөх тос багатай мах, загас</Text>
                        <Text style={styles.recommendationItem}>• Өөх тос багатай сүүн бүтээгдэхүүн</Text>
                        <Text style={styles.recommendationItem}>• Самар, үр</Text>
                      </View>
                    </View>

                    <View style={styles.recommendationCard}>
                      <Text style={styles.recommendationCardTitle}>Хязгаарлах хүнс</Text>
                      <View style={styles.recommendationList}>
                        <Text style={styles.recommendationItem}>• Боловсруулсан хүнс</Text>
                        <Text style={styles.recommendationItem}>• Түргэн хоол</Text>
                        <Text style={styles.recommendationItem}>• Чихэрлэг ундаа</Text>
                        <Text style={styles.recommendationItem}>• Их хэмжээний сахар агуулсан хүнс</Text>
                        <Text style={styles.recommendationItem}>• Их хэмжээний давс агуулсан хүнс</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </Tab>
      </TabView>
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
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderColor: "#fef3c7",
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#92400e",
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 12,
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  outlineButtonText: {
    color: "#6366f1",
    fontWeight: "600",
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  spinningIcon: {
    marginRight: 8,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  resultContainer: {
    marginBottom: 16,
  },
  resultSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  foodItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
  },
  foodItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  foodItemCalories: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  foodItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  foodItemPortion: {
    fontSize: 14,
    color: "#6b7280",
  },
  foodItemCarbs: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "500",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  carbsLabel: {
    color: "#8b5cf6",
  },
  carbsValue: {
    color: "#8b5cf6",
  },
  warningContainer: {
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    borderColor: "#fef3c7",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: "flex-start",
  },
  warningMessage: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#92400e",
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  foodTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  foodTypeTag: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 2,
  },
  foodTypeText: {
    fontSize: 12,
    color: "#4b5563",
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  detailedFoodItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  detailedFoodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailedFoodName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  detailedFoodCalories: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  detailedFoodDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailedFoodPortion: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailedFoodCarbs: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "500",
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationSection: {
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationList: {
    marginTop: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 6,
    lineHeight: 20,
  },
  recommendationGrid: {
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendationCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
})
