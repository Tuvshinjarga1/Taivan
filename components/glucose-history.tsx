"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

interface GlucoseReading {
  id: string;
  value: number;
  timestamp: Date;
  type: string;
}

interface GlucoseHistoryProps {
  readings: GlucoseReading[];
}

export default function GlucoseHistory({ readings }: GlucoseHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Sort readings by timestamp (newest first)
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Simple search functionality
  const filteredReadings = sortedReadings.filter(
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

  return (
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
                      {new Date(reading.timestamp).toLocaleString("mn-MN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
  );
}
