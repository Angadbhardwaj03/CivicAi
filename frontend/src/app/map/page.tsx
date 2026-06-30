"use client"
import Link from "next/link";
import { useState } from "react";
import { Leaf, MapPin, Filter, Layers, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import DynamicDashboardMap from "@/components/DynamicDashboardMap";
import Footer from "@/components/Footer";
import { UserButton, useUser } from "@clerk/nextjs";

interface Complaint {
  id: string;
  title: string;
  category: string;
  severity: string;
  aiSummary: string;
  status: string;
  date: string;
  lat: number;
  lng: number;
}

export default function LiveIssueMapPage() {
  const { user, isSignedIn } = useUser();
  const [complaints] = useState<Complaint[]>([
    { id: "REP-1023", title: "Chemical Spill near Lake", category: "Environment", severity: "Critical", aiSummary: "Severe toxic spill detected. Requires immediate hazmat containment.", status: "Urgent", date: "2 hrs ago", lat: 28.6139, lng: 77.2090 },
    { id: "REP-1024", title: "Fallen Tree Branch", category: "Debris", severity: "Medium", aiSummary: "Oak tree branch blocking pedestrian walkway.", status: "In Progress", date: "1 day ago", lat: 28.6250, lng: 77.2200 },
    { id: "REP-1025", title: "Illegal Dumping", category: "Sanitation", severity: "High", aiSummary: "Construction waste dumped in the protected green belt.", status: "Pending", date: "yesterday", lat: 28.6000, lng: 77.1900 },
  ]);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filteredComplaints = complaints.filter(c => {
    const matchesCategory = categoryFilter === "all" || c.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSeverity = severityFilter === "all" || c.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesCategory && matchesSeverity;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-3xl rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/15 blur-3xl rounded-full z-0 pointer-events-none" />

      {/* Header */}
      <header className="px-6 lg:px-8 h-20 flex items-center border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2 font-bold text-2xl text-primary" href="/">
          <Leaf className="w-8 h-8 text-secondary-foreground" />
          CivicAI
        </Link>
        <nav className="ml-auto flex gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium text-primary transition-colors" href="/map">
            Live Issue Map
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/analytics">
            Transparency
          </Link>
          {!isSignedIn ? (
            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="rounded-full shadow-sm">Log In</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 hover:bg-secondary/15 transition-all">
              <span className="text-xs font-bold text-foreground">
                Hi, {user?.firstName || "Citizen"}
              </span>
              <UserButton />
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10 z-10 max-w-6xl">
        <div className="flex flex-col gap-6">
          {/* Breadcrumb / Back button */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary pl-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
              </Button>
            </Link>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <MapPin className="w-8 h-8 text-primary" /> Live Issue Map
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Real-time geospatial tracking of municipal issues and environmental hazards reported across the territory.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 items-start mt-4">
            {/* Filters Sidebar */}
            <Card className="lg:col-span-1 border-border/50 bg-card/70 backdrop-blur-sm rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-primary" /> Filters
                </h3>
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                    <div className="flex flex-col gap-1.5">
                      {["all", "Environment", "Sanitation", "Debris"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`text-left text-sm px-3 py-2 rounded-xl transition-all font-medium ${
                            categoryFilter.toLowerCase() === cat.toLowerCase()
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {cat === "all" ? "All Categories" : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</label>
                    <div className="flex flex-col gap-1.5">
                      {["all", "Critical", "High", "Medium"].map(sev => (
                        <button
                          key={sev}
                          onClick={() => setSeverityFilter(sev)}
                          className={`text-left text-sm px-3 py-2 rounded-xl transition-all font-medium ${
                            severityFilter.toLowerCase() === sev.toLowerCase()
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {sev === "all" ? "All Severities" : sev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="border-t border-border/50 pt-4">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5 mb-2">
                  <Layers className="w-4 h-4 text-primary" /> Map Layers
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Showing <span className="font-bold text-primary">{filteredComplaints.length}</span> active report pins on the map. Click any pin to view details and status.
                </p>
              </div>
            </Card>

            {/* Map Container */}
            <div className="lg:col-span-3">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm rounded-3xl overflow-hidden p-2">
                <DynamicDashboardMap complaints={filteredComplaints} />
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
