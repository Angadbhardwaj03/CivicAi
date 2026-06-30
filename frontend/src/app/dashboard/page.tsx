"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, AlertCircle, Clock, MapPin, Leaf, BarChart3, Search, Filter, RefreshCw, 
  Trophy, Medal, Star, ShieldCheck, UserCheck, Upload 
} from "lucide-react";
import DynamicDashboardMap from "@/components/DynamicDashboardMap";

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
  upvotes: number;
  assignedOfficer: string | null;
  slaLimit: string | null;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "queue" | "map" | "leaderboard">("overview");
  
  const [complaints, setComplaints] = useState<Complaint[]>([
    { id: "REP-1023", title: "Chemical Spill near Lake", category: "Environment", severity: "Critical", aiSummary: "Severe toxic spill detected. Requires immediate hazmat containment.", status: "Urgent", date: "2 hrs ago", lat: 28.6139, lng: 77.2090, upvotes: 42, assignedOfficer: null, slaLimit: null },
    { id: "REP-1024", title: "Fallen Tree Branch", category: "Debris", severity: "Medium", aiSummary: "Oak tree branch blocking pedestrian walkway.", status: "In Progress", date: "1 day ago", lat: 28.6250, lng: 77.2200, upvotes: 12, assignedOfficer: "Officer Sarah Jenkins", slaLimit: "48 Hours" },
    { id: "REP-1025", title: "Illegal Dumping", category: "Sanitation", severity: "High", aiSummary: "Construction waste dumped in the protected green belt.", status: "Pending", date: "yesterday", lat: 28.6000, lng: 77.1900, upvotes: 28, assignedOfficer: null, slaLimit: null },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});

  // Leaderboard / Gamification states
  const [userPoints, setUserPoints] = useState<number>(1150);
  const [verifiedTasks, setVerifiedTasks] = useState<string[]>([]);
  const [showVerifyModal, setShowVerifyModal] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationNote, setVerificationNote] = useState("");
  const [imgSelected, setImgSelected] = useState(false);

  useEffect(() => {
    const savedPoints = localStorage.getItem("civic_ai_points");
    const savedTasks = localStorage.getItem("civic_ai_verified_tasks");
    if (savedPoints) setUserPoints(parseInt(savedPoints));
    if (savedTasks) setVerifiedTasks(JSON.parse(savedTasks));
  }, []);

  const savePoints = (points: number, tasks: string[]) => {
    setUserPoints(points);
    setVerifiedTasks(tasks);
    localStorage.setItem("civic_ai_points", points.toString());
    localStorage.setItem("civic_ai_verified_tasks", JSON.stringify(tasks));
  };

  const tasksToVerify = [
    { id: "REP-1025", title: "Illegal Dumping in Green Belt", category: "Sanitation", resolvedBy: "Officer Marcus Vance", date: "3 hrs ago" },
    { id: "REP-1024", title: "Fallen Tree Branch", category: "Debris", resolvedBy: "Officer Sarah Jenkins", date: "1 day ago" },
    { id: "REP-1029", title: "Broken Streetlight on Park Lane", category: "Infrastructure", resolvedBy: "Officer David Miller", date: "2 days ago" },
  ].filter(t => !verifiedTasks.includes(t.id));

  // Dynamic ranking list
  const baseLeaders = [
    { name: "Sarah J.", points: 2450, badge: "Community Hero" },
    { name: "Mike T.", points: 1980, badge: "Gold Citizen" },
    { name: "Alex W.", points: 1540, badge: "Silver Citizen" },
    { name: "You (Priya M.)", points: userPoints, badge: userPoints > 1500 ? "Silver Citizen" : "Active Reporter", isCurrentUser: true },
    { name: "John D.", points: 850, badge: "Helpful Neighbor" },
  ];

  const leaders = baseLeaders
    .sort((a, b) => b.points - a.points)
    .map((leader, index) => ({ ...leader, rank: index + 1 }));

  const handleVerifySubmit = (taskId: string) => {
    setUploading(true);
    setTimeout(() => {
      const newPoints = userPoints + 50;
      const newTasks = [...verifiedTasks, taskId];
      savePoints(newPoints, newTasks);
      
      setUploading(false);
      setShowVerifyModal(null);
      setVerificationNote("");
      setImgSelected(false);
      
      alert(`Thank you for keeping the community honest! Verification submitted. +50 XP acquired!`);
    }, 1200);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAssignOfficer = (id: string, officer: string | null, sla: string | null) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, assignedOfficer: officer, slaLimit: sla, status: officer ? "ASSIGNED" : c.status } : c));
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(prev => prev ? { ...prev, assignedOfficer: officer, slaLimit: sla, status: officer ? "ASSIGNED" : prev.status } : null);
    }
  };

  const handleUpvote = (id: string) => {
    if (userVoted[id]) return; // Already voted
    setUserVoted(prev => ({ ...prev, [id]: true }));
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c));
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.aiSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || c.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  const totalActive = complaints.filter(c => c.status !== "Resolved").length;
  const totalResolved = complaints.filter(c => c.status === "Resolved").length;

  return (
    <div className="flex min-h-screen w-full bg-background flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="flex flex-col w-full md:w-72 border-b md:border-b-0 md:border-r border-border/50 bg-card p-6 shadow-sm z-10">
        <div className="flex items-center gap-2 text-primary font-extrabold text-2xl mb-8 mt-2">
           <Leaf className="w-6 h-6" /> CivicAI
        </div>
         <nav className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          <Button 
            variant={activeTab === "overview" ? "secondary" : "ghost"} 
            onClick={() => setActiveTab("overview")}
            className={`justify-start rounded-xl h-12 flex-1 md:flex-initial ${activeTab === "overview" ? "bg-primary/10 text-primary hover:bg-primary/25" : "text-muted-foreground hover:bg-slate-50"}`}
          >
             <BarChart3 className="mr-3 w-5 h-5"/> Progress Overview
          </Button>
          <Button 
            variant={activeTab === "queue" ? "secondary" : "ghost"} 
            onClick={() => setActiveTab("queue")}
            className={`justify-start rounded-xl h-12 flex-1 md:flex-initial ${activeTab === "queue" ? "bg-primary/10 text-primary hover:bg-primary/25" : "text-muted-foreground hover:bg-slate-50"}`}
          >
             <AlertCircle className="mr-3 w-5 h-5"/> Live Queue
          </Button>
          <Button 
            variant={activeTab === "map" ? "secondary" : "ghost"} 
            onClick={() => setActiveTab("map")}
            className={`justify-start rounded-xl h-12 flex-1 md:flex-initial ${activeTab === "map" ? "bg-primary/10 text-primary hover:bg-primary/25" : "text-muted-foreground hover:bg-slate-50"}`}
          >
             <MapPin className="mr-3 w-5 h-5"/> Territorial Map
          </Button>
          <Button 
            variant={activeTab === "leaderboard" ? "secondary" : "ghost"} 
            onClick={() => setActiveTab("leaderboard")}
            className={`justify-start rounded-xl h-12 flex-1 md:flex-initial ${activeTab === "leaderboard" ? "bg-primary/10 text-primary hover:bg-primary/25" : "text-muted-foreground hover:bg-slate-50"}`}
          >
             <Trophy className="mr-3 w-5 h-5"/> Civic Honor
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 relative overflow-hidden flex flex-col">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                {activeTab === "overview" && "Progress Report"}
                {activeTab === "queue" && "Live Operations Queue"}
                {activeTab === "map" && "Geospatial Territory Map"}
                {activeTab === "leaderboard" && "Civic Honor & Leaderboard"}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {activeTab === "overview" && "Your city operations at a glance."}
                {activeTab === "queue" && "Triage, assign, and update active city complaints."}
                {activeTab === "map" && "Visual distribution of community issues."}
                {activeTab === "leaderboard" && "Earn XP by verifying resolved issues in your neighborhood."}
              </p>
            </div>
            {activeTab === "overview" && (
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                Export Analytics
              </Button>
            )}
          </div>

          {/* Tab Content: Progress Overview */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-3xl border-border/50 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle className="w-16 h-16"/></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-extrabold text-foreground">{totalActive}</div>
                    <p className="text-sm font-medium text-destructive mt-1 flex items-center gap-1">
                       Needs response
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="rounded-3xl border-border/50 shadow-sm bg-card/60 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-green-500 opacity-10"><CheckCircle2 className="w-16 h-16"/></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resolved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-extrabold text-foreground">{totalResolved}</div>
                    <p className="text-sm font-medium text-emerald-600 mt-1">
                       Eco-impact minimized
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Table */}
              <Card className="rounded-3xl border-border/50 bg-card overflow-hidden shadow-sm">
                <CardHeader className="px-8 pt-8 pb-4 border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-xl">Latest AI Triaged Complaints</CardTitle>
                  <CardDescription>Live feed of civic issues sorted by priority.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/40">
                        <tr>
                           <th className="px-8 py-4 font-semibold">Issue</th>
                           <th className="px-8 py-4 font-semibold">AI Summary</th>
                           <th className="px-8 py-4 font-semibold">Priority</th>
                           <th className="px-8 py-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {complaints.slice(0, 5).map(req => (
                          <tr key={req.id} className="hover:bg-muted/10 transition-colors group cursor-pointer" onClick={() => { setActiveTab("queue"); setSelectedComplaint(req); }}>
                            <td className="px-8 py-5">
                               <div className="font-bold text-foreground text-base mb-1">{req.title}</div>
                               <div className="text-muted-foreground text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3"/> {req.date} &bull; {req.id}
                               </div>
                            </td>
                            <td className="px-8 py-5 text-muted-foreground max-w-[300px] leading-relaxed">
                              {req.aiSummary}
                            </td>
                            <td className="px-8 py-5">
                               <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                  req.severity === 'Critical' ? 'bg-destructive/15 text-destructive border border-destructive/20' : 
                                  req.severity === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                 {req.severity}
                               </span>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`text-sm font-semibold flex items-center gap-1.5 ${req.status === 'Urgent' || req.status === 'Pending' ? 'text-destructive' : 'text-primary'}`}>
                                 {req.status === 'Resolved' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                 {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab Content: Live Queue */}
          {activeTab === "queue" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
              {/* Left 2 cols: List & Filters */}
              <div className="lg:col-span-2 space-y-6 flex flex-col">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search complaints by ID, title, summary..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-background px-3 py-1.5 border border-border rounded-xl">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select 
                        value={severityFilter} 
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="bg-transparent text-sm focus:outline-none text-foreground font-medium cursor-pointer"
                      >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Complaint List */}
                <div className="space-y-4 overflow-y-auto max-h-[550px] pr-2">
                  {filteredComplaints.length === 0 ? (
                    <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border text-muted-foreground">
                      No complaints found matching current filters.
                    </div>
                  ) : (
                    filteredComplaints.map((c) => (
                      <div 
                        key={c.id}
                        onClick={() => setSelectedComplaint(c)}
                        className={`p-5 bg-card rounded-2xl border transition-all cursor-pointer ${selectedComplaint?.id === c.id ? 'border-primary shadow-sm bg-primary/5' : 'border-border/50 hover:border-border hover:shadow-sm'}`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{c.id}</span>
                            <h3 className="font-bold text-lg text-foreground mt-0.5">{c.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpvote(c.id);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                                userVoted[c.id] 
                                  ? 'bg-secondary text-secondary-foreground border-secondary' 
                                  : 'bg-muted hover:bg-primary/15 hover:text-primary border-border/50'
                              }`}
                            >
                              ▲ {c.upvotes}
                            </button>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              c.severity === 'Critical' ? 'bg-destructive/15 text-destructive' : 
                              c.severity === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary'}`}>
                              {c.severity}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{c.aiSummary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/20">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {c.date}</span>
                          <div className="flex items-center gap-2">
                            {c.assignedOfficer && (
                              <span className="px-2 py-0.5 bg-yellow-50 text-yellow-800 rounded border border-yellow-100 font-medium scale-90">Assigned</span>
                            )}
                            <span className={`font-semibold ${c.status === 'Resolved' ? 'text-emerald-600' : 'text-primary'}`}>{c.status}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
 
              {/* Right 1 col: Details Panel */}
              <div className="lg:col-span-1">
                {selectedComplaint ? (
                  <Card className="rounded-3xl border-border/50 bg-card shadow-sm sticky top-4">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground font-bold">{selectedComplaint.id}</span>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            selectedComplaint.severity === 'Critical' ? 'bg-destructive/15 text-destructive' : 
                            selectedComplaint.severity === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary'}`}>
                            {selectedComplaint.severity}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground">{selectedComplaint.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1.5"><Clock className="w-4 h-4"/> Reported {selectedComplaint.date}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Diagnosis Summary</h4>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">👍 {selectedComplaint.upvotes} Citizens Endorsed</span>
                        </div>
                        <p className="text-sm text-foreground bg-muted/30 p-4 rounded-2xl leading-relaxed border border-border/20">{selectedComplaint.aiSummary}</p>
                      </div>
 
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Category</h4>
                          <span className="text-sm font-semibold text-foreground bg-slate-100 px-3 py-1 rounded-lg inline-block">{selectedComplaint.category}</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Current Status</h4>
                          <span className={`text-sm font-bold flex items-center gap-1.5 ${
                            selectedComplaint.status === 'Resolved' ? 'text-emerald-600' : 
                            selectedComplaint.status === 'Pending Verification' ? 'text-amber-600' : 'text-primary'}`}>
                            {selectedComplaint.status}
                          </span>
                        </div>
                      </div>

                      {/* Officer Assignment Panel */}
                      <div className="border-t border-border/50 pt-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Municipal Assignment & SLA</h4>
                        {selectedComplaint.assignedOfficer ? (
                          <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-2xl space-y-2">
                            <p className="text-sm text-yellow-900 font-medium">👨‍💼 Assigned to: <span className="font-bold">{selectedComplaint.assignedOfficer}</span></p>
                            <p className="text-xs text-yellow-800 flex items-center gap-1.5 font-semibold">
                              ⌛ SLA: {selectedComplaint.slaLimit} remaining
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAssignOfficer(selectedComplaint.id, null, null)}
                              className="text-xs text-red-600 hover:text-red-700 p-0 h-6 hover:bg-transparent"
                            >
                              Revoke Assignment
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <select 
                                id="officer-select"
                                className="flex-1 text-xs bg-background border border-border rounded-xl px-2.5 py-2 text-foreground focus:outline-none"
                                defaultValue=""
                              >
                                <option value="" disabled>Select Officer</option>
                                <option value="Officer Sarah Jenkins">Officer Sarah Jenkins (PWD)</option>
                                <option value="Officer Marcus Vance">Officer Marcus Vance (Sanitation)</option>
                                <option value="Officer David Miller">Officer David Miller (Forestry)</option>
                              </select>
                              <select 
                                id="sla-select"
                                className="w-28 text-xs bg-background border border-border rounded-xl px-2.5 py-2 text-foreground focus:outline-none"
                                defaultValue=""
                              >
                                <option value="" disabled>SLA Target</option>
                                <option value="24 Hours">24 Hours</option>
                                <option value="48 Hours">48 Hours</option>
                                <option value="72 Hours">72 Hours</option>
                              </select>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                const officerEl = document.getElementById("officer-select") as HTMLSelectElement;
                                const slaEl = document.getElementById("sla-select") as HTMLSelectElement;
                                if (officerEl?.value && slaEl?.value) {
                                  handleAssignOfficer(selectedComplaint.id, officerEl.value, slaEl.value);
                                }
                              }}
                              className="w-full text-xs rounded-xl bg-primary hover:bg-primary/90 h-9 shrink-0"
                            >
                              Assign Work Order
                            </Button>
                          </div>
                        )}
                      </div>
 
                      <div className="border-t border-border/50 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleStatusChange(selectedComplaint.id, "In Progress")}
                            className="flex-1 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                          >
                            Mark In Progress
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleStatusChange(selectedComplaint.id, "Pending Verification")}
                            className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            Mark Resolved (Verify)
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center bg-card/50 border border-dashed border-border rounded-3xl text-muted-foreground min-h-[300px]">
                    Select a complaint from the queue to view details and take actions.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Territorial Map */}
          {activeTab === "map" && (
            <div className="flex-1 min-h-[500px] flex flex-col relative z-25">
              <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-border/30">
                <div>
                  <h3 className="font-bold text-lg text-foreground">Operational Heatmap</h3>
                  <p className="text-xs text-muted-foreground">Coordinates mapped in real-time from citizen report submissions.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3.5 w-3.5 rounded-full bg-red-500 inline-block"></span> Critical</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3.5 w-3.5 rounded-full bg-amber-500 inline-block"></span> High</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3.5 w-3.5 rounded-full bg-green-500 inline-block"></span> Medium</div>
                </div>
              </div>
              <div className="flex-1 min-h-[500px]">
                <DynamicDashboardMap complaints={complaints} />
              </div>
            </div>
          )}

          {/* Tab Content: Leaderboard */}
          {activeTab === "leaderboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 items-start flex-1">
              {/* Leaderboard list */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-border/50 bg-card/75 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Top Performing Citizens</CardTitle>
                      <CardDescription>Rankings updated in real-time based on verified community actions.</CardDescription>
                    </div>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl font-bold flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      <span>{userPoints} XP</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {leaders.map((leader) => (
                      <div 
                        key={leader.name} 
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          leader.isCurrentUser 
                            ? "bg-primary/5 border-primary shadow-sm" 
                            : "bg-white/50 border-border/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 flex justify-center text-sm font-extrabold text-muted-foreground">
                            #{leader.rank}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            {leader.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                            {leader.rank === 2 && <Medal className="w-5 h-5 text-slate-400" />}
                            {leader.rank === 3 && <Medal className="w-5 h-5 text-amber-700" />}
                            {leader.rank > 3 && <Star className="w-5 h-5 text-primary/40" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                              {leader.name}
                              {leader.isCurrentUser && (
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">You</span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">{leader.badge}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-foreground">{leader.points} XP</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Tasks to verify sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-border/50 bg-card/75 backdrop-blur-sm rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" /> Verify Resolutions
                    </CardTitle>
                    <CardDescription>
                      Earn **+50 XP** per task by checking if these issues are resolved in your area.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tasksToVerify.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                        🎉 No pending verifications in your area! Check back later.
                      </div>
                    ) : (
                      tasksToVerify.map((task) => (
                        <div key={task.id} className="p-4 bg-white/60 border border-border/50 rounded-2xl space-y-3 shadow-xs">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-muted-foreground font-bold">{task.id}</span>
                              <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded font-medium">{task.category}</span>
                            </div>
                            <h4 className="font-bold text-foreground text-sm">{task.title}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Resolved by: <span className="font-semibold text-primary">{task.resolvedBy}</span></p>
                          </div>
                          <Button 
                            onClick={() => setShowVerifyModal(task)}
                            className="w-full text-xs rounded-xl bg-primary hover:bg-primary/90 h-9"
                          >
                            Verify Resolution (+50 XP)
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-white rounded-3xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-extrabold text-xl text-foreground">Verify Resolution</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Confirm if **{showVerifyModal.title}** ({showVerifyModal.id}) has been successfully resolved.
              </p>
            </div>

            <div className="space-y-4">
              {/* Mock photo upload area */}
              <div 
                onClick={() => setImgSelected(true)}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  imgSelected 
                    ? "border-emerald-500 bg-emerald-50/20 text-emerald-700" 
                    : "border-border hover:border-primary/50 text-muted-foreground hover:text-primary"
                }`}
              >
                <Upload className="w-8 h-8" />
                <span className="text-xs font-bold">
                  {imgSelected ? "✓ Photo Proof uploaded successfully" : "Upload Photo Proof of Fix"}
                </span>
                <span className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</span>
              </div>

              {/* Note input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Verification Note</label>
                <Input
                  placeholder="e.g. The debris is fully cleared, walkway is open."
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  className="rounded-xl border-border"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowVerifyModal(null);
                  setImgSelected(false);
                  setVerificationNote("");
                }}
                className="flex-1 rounded-xl border-border h-11 text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button
                disabled={uploading || !imgSelected}
                onClick={() => handleVerifySubmit(showVerifyModal.id)}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 h-11 text-sm font-semibold text-white"
              >
                {uploading ? "Submitting..." : "Submit Proof"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


