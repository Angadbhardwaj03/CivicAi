"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsPage() {
  const resolutionData = [
    { name: 'Jan', resolved: 400, reported: 540 },
    { name: 'Feb', resolved: 600, reported: 720 },
    { name: 'Mar', resolved: 850, reported: 890 },
    { name: 'Apr', resolved: 1100, reported: 1050 },
    { name: 'May', resolved: 1400, reported: 1300 },
  ];

  const categoryData = [
    { name: 'Roads', count: 420 },
    { name: 'Water', count: 380 },
    { name: 'Electricity', count: 210 },
    { name: 'Sanitation', count: 180 },
    { name: 'Parks', count: 90 },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900">Public Transparency Dashboard</h1>
        <p className="text-gray-500 mt-2">Open data analytics scaling trust between citizens and government.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Issues Reported vs Resolved (2026)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reported" stroke="#94a3b8" strokeWidth={2} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#2563eb" strokeWidth={3} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
