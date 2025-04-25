"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Статик өгөгдөл
const staticGlucoseReadings = [
  {
    id: "g1",
    value: 110,
    timestamp: "2023-04-20T07:28:00Z",
    type: "Хооллохын өмнө",
  },
  {
    id: "g2",
    value: 135,
    timestamp: "2023-04-20T06:30:00Z",
    type: "Хооллосноос хойш",
  },
  {
    id: "g3",
    value: 105,
    timestamp: "2023-04-20T05:45:00Z",
    type: "Хооллохын өмнө",
  },
  {
    id: "g4",
    value: 142,
    timestamp: "2023-04-19T10:15:00Z",
    type: "Хооллосноос хойш",
  },
  {
    id: "g5",
    value: 118,
    timestamp: "2023-04-18T08:30:00Z",
    type: "Хооллохын өмнө",
  },
  {
    id: "g6",
    value: 138,
    timestamp: "2023-04-17T12:45:00Z",
    type: "Хооллосноос хойш",
  },
  {
    id: "g7",
    value: 98,
    timestamp: "2023-04-16T06:00:00Z",
    type: "Өлөн үед",
  },
];

// Статик хэрэглэгчийн ID
const staticUserId = "demo-user-123";

export default function GlucoseTrackerPage() {
  const [activeTab, setActiveTab] = useState("chart");
  const [value, setValue] = useState(110);
  const [type, setType] = useState("Хооллохын өмнө");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Simple search functionality
  const filteredReadings = staticGlucoseReadings.filter(
    (reading) =>
      reading.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.value.toString().includes(searchTerm.toLowerCase())
  );

  // Function to get color based on glucose value
  const getStatusColor = (value: number) => {
    if (value < 70) return "text-blue-600 bg-blue-100";
    if (value <= 140) return "text-green-600 bg-green-100";
    if (value <= 180) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  // Function to get status label based on glucose value
  const getStatusLabel = (value: number) => {
    if (value < 70) return "Бага";
    if (value <= 140) return "Хэвийн";
    if (value <= 180) return "Өндөр";
    return "Маш өндөр";
  };

  // Simulate submitting a new reading
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      // Switch to chart tab
      setActiveTab("chart");
      // Show some kind of success message if needed
    }, 1000);
  };

  return (
    <div className="px-4 py-4 mx-auto max-w-5xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Буцах
        </Button>
        <h1 className="text-2xl font-bold">Цусны сахарын хяналт</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Хамгийн сүүлийн хэмжилт</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-3xl font-bold">
                {staticGlucoseReadings[0].value} мг/дл
              </div>
              <div className="text-sm text-muted-foreground">
                2023 оны 4-р сарын 20, 07:28
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {getStatusLabel(staticGlucoseReadings[0].value)}
              </span>
              <div className="text-sm text-muted-foreground mt-1">
                {staticGlucoseReadings[0].type}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chart" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">График</TabsTrigger>
          <TabsTrigger value="history">Түүх</TabsTrigger>
          <TabsTrigger value="add">Шинэ хэмжилт</TabsTrigger>
        </TabsList>

        {/* График харуулах */}
        <TabsContent value="chart" className="p-0 border-none">
          <Card>
            <CardHeader>
              <CardTitle>
                Сахарын түвшний хугацаанаас хамаарах өөрчлөлт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Туршилтын орчин
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Хэмжилтийн түүх */}
        <TabsContent value="history" className="p-0 border-none">
          <Card>
            <CardHeader>
              <CardTitle>Сахарын хэмжилтийн түүх</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Хайх..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Огноо</TableHead>
                      <TableHead>Хэмжээ</TableHead>
                      <TableHead>Төрөл</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReadings.length > 0 ? (
                      filteredReadings.map((reading) => (
                        <TableRow key={reading.id}>
                          <TableCell className="font-medium">
                            {reading.id === "g1" && "2023/04/20, 07:28"}
                            {reading.id === "g2" && "2023/04/20, 06:30"}
                            {reading.id === "g3" && "2023/04/20, 05:45"}
                            {reading.id === "g4" && "2023/04/19, 10:15"}
                            {reading.id === "g5" && "2023/04/18, 08:30"}
                            {reading.id === "g6" && "2023/04/17, 12:45"}
                            {reading.id === "g7" && "2023/04/16, 06:00"}
                          </TableCell>
                          <TableCell>{reading.value} мг/дл</TableCell>
                          <TableCell>{reading.type}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                reading.value
                              )}`}
                            >
                              {getStatusLabel(reading.value)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Хэмжилт олдсонгүй
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Шинэ хэмжилт нэмэх */}
        <TabsContent value="add" className="p-0 border-none">
          <Card>
            <CardHeader>
              <CardTitle>Шинэ хэмжилт нэмэх</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="value" className="text-sm font-medium">
                    Сахарын хэмжээ (мг/дл)
                  </label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    min="20"
                    max="600"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Хэмжилтийн төрөл
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Хооллохын өмнө">Хооллохын өмнө</option>
                    <option value="Хооллосноос хойш">Хооллосноос хойш</option>
                    <option value="Өлөн үед">Өлөн үед</option>
                    <option value="Унтахын өмнө">Унтахын өмнө</option>
                    <option value="Дасгалын дараа">Дасгалын дараа</option>
                  </select>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
