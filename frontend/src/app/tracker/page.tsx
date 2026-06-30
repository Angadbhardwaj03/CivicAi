"use client"
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Search, ArrowLeft, Clock, CheckCircle2, AlertCircle, ShieldAlert, User, Calendar, Loader2, Shield } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import Footer from "@/components/Footer";

interface TrackedReport {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  date: string;
  department?: string;
  assignedOfficer?: string | null;
  slaLimit?: string | null;
  severity?: string;
}

interface TrackerContentProps {
  authorityMode: boolean;
  setAuthorityMode: (val: boolean) => void;
}

function TrackerContent({ authorityMode, setAuthorityMode }: TrackerContentProps) {
  const searchParams = useSearchParams();
  const [searchId, setSearchId] = useState("");
  const [activeReport, setActiveReport] = useState<TrackedReport | null>(null);
  const [recentReports, setRecentReports] = useState<TrackedReport[]>([]);
  const [searched, setSearched] = useState(false);

  const [selectedOfficer, setSelectedOfficer] = useState("Officer Marcus Vance");
  const [selectedSla, setSelectedSla] = useState("48 Hours");
  const [selectedStatus, setSelectedStatus] = useState("In Progress");

  // Pre-populated reports for testing/mocking matching dashboard
  const systemReports: TrackedReport[] = [
    { id: "REP-1023", title: "Chemical Spill near Lake", category: "Environment", description: "Severe toxic spill detected. Requires immediate hazmat containment.", status: "Urgent", date: "2 hrs ago", department: "Environmental Protection Agency", assignedOfficer: null, severity: "Critical" },
    { id: "REP-1024", title: "Fallen Tree Branch", category: "Debris", description: "Oak tree branch blocking pedestrian walkway.", status: "In Progress", date: "1 day ago", department: "Forestry & Parks", assignedOfficer: "Officer Sarah Jenkins", slaLimit: "48 Hours", severity: "Medium" },
    { id: "REP-1025", title: "Illegal Dumping", category: "Sanitation", description: "Construction waste dumped in the protected green belt.", status: "Pending", date: "yesterday", department: "Sanitation & Waste Management", assignedOfficer: null, severity: "High" },
  ];

  useEffect(() => {
    // Load user submitted reports from localStorage
    const saved = localStorage.getItem("user_submitted_reports");
    let userReports: TrackedReport[] = [];
    if (saved) {
      userReports = JSON.parse(saved);
      setRecentReports(userReports);
    }

    // Check if there is an ID in the URL params
    const idParam = searchParams.get("id");
    if (idParam) {
      setSearchId(idParam);
      handleSearch(idParam, userReports);
    }
  }, [searchParams]);

  // Sync authority inputs when active report changes
  useEffect(() => {
    if (activeReport) {
      setSelectedOfficer(activeReport.assignedOfficer || "Officer Marcus Vance");
      setSelectedSla(activeReport.slaLimit || "48 Hours");
      setSelectedStatus(activeReport.status || "In Progress");
    }
  }, [activeReport]);

  const handleSearch = (id: string, customList?: TrackedReport[]) => {
    const term = id.trim().toUpperCase();
    if (!term) return;

    const listToSearch = customList || recentReports;
    // Search in system reports or user's local reports
    const found = systemReports.find(r => r.id === term) || listToSearch.find(r => r.id === term);
    
    if (found) {
      setActiveReport(found);
    } else {
      setActiveReport(null);
    }
    setSearched(true);
  };

  const handleAuthorityUpdate = () => {
    if (!activeReport) return;

    const updatedReport: TrackedReport = {
      ...activeReport,
      assignedOfficer: selectedOfficer,
      slaLimit: selectedSla,
      status: selectedStatus,
    };

    setActiveReport(updatedReport);

    // Update in recentReports list if it's a user report
    const isUserReport = recentReports.some(r => r.id === activeReport.id);
    if (isUserReport) {
      const updatedRecent = recentReports.map(r => r.id === activeReport.id ? updatedReport : r);
      setRecentReports(updatedRecent);
      localStorage.setItem("user_submitted_reports", JSON.stringify(updatedRecent));
    } else {
      // Also save system reports to local storage once modified so updates persist
      const saved = localStorage.getItem("user_submitted_reports");
      const list = saved ? JSON.parse(saved) : [];
      const updatedList = [updatedReport, ...list.filter((r: any) => r.id !== updatedReport.id)];
      setRecentReports(updatedList);
      localStorage.setItem("user_submitted_reports", JSON.stringify(updatedList));
    }
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { name: "Report Submitted", desc: "AI categorized & routed", done: true },
      { name: "Triage & Review", desc: "Department acknowledged", done: status !== "Pending" },
      { name: "Officer Dispatched", desc: "Work order assigned", done: status === "In Progress" || status === "Resolved" || status === "ASSIGNED" },
      { name: "Issue Resolved", desc: "Awaiting community verification", done: status === "Resolved" },
    ];
    return steps;
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary pl-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="text-center max-w-xl mx-auto space-y-3 mb-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Track Your Complaint</h1>
        <p className="text-muted-foreground text-sm">
          Enter your unique Submission ID below to view real-time operations status, assigned crew, and progress timeline.
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-xl mx-auto w-full mb-8">
        <div className="flex gap-2 p-1.5 bg-white/70 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm focus-within:border-primary/50 transition-all">
          <Input
            placeholder="Enter Submission ID (e.g. REP-1024)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchId)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base rounded-xl"
          />
          <Button 
            onClick={() => handleSearch(searchId)}
            className="rounded-xl bg-primary hover:bg-primary/95 text-white px-5"
          >
            <Search className="w-4.5 h-4.5 mr-2" /> Track
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Dashboard / Status Timeline details */}
        <div className="lg:col-span-2 space-y-6">
          {activeReport ? (
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/75 backdrop-blur-sm rounded-3xl overflow-hidden shadow-md p-6 space-y-6">
                {/* Status header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/40 pb-5 gap-3">
                  <div>
                    <span className="text-[10px] bg-secondary text-secondary-foreground font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {activeReport.category}
                    </span>
                    <h2 className="text-xl font-extrabold text-foreground mt-2">{activeReport.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1">Submission ID: <span className="font-mono font-bold text-primary">{activeReport.id}</span></p>
                  </div>
                  <div className="text-right flex flex-col items-start sm:items-end">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                      activeReport.status === 'Urgent' || activeReport.status === 'Critical' ? 'bg-red-100 text-red-700' :
                      activeReport.status === 'In Progress' || activeReport.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                      activeReport.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      Status: {activeReport.status}
                    </span>
                    {activeReport.date && <span className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Reported {activeReport.date}</span>}
                  </div>
                </div>

                {/* Description & Metadata */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Description</h4>
                    <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{activeReport.description}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50/70 border border-border/30 rounded-2xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-[11px] text-muted-foreground font-semibold uppercase">Department Assigned</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">{activeReport.department || "AI Routing Bureau"}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/70 border border-border/30 rounded-2xl flex items-start gap-3">
                      <User className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-[11px] text-muted-foreground font-semibold uppercase">Assigned Officer</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">{activeReport.assignedOfficer || "Awaiting dispatch"}</div>
                        {activeReport.slaLimit && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">SLA: {activeReport.slaLimit}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Timeline progress */}
                <div className="pt-4 border-t border-border/40">
                  <h3 className="font-extrabold text-foreground mb-6">Resolution Timeline</h3>
                  <div className="relative pl-6 border-l-2 border-dashed border-primary/20 space-y-6 ml-3">
                    {getTimelineSteps(activeReport.status).map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Node indicator */}
                        <span className={`absolute -left-[32px] top-0.5 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                          step.done ? "bg-primary text-white" : "bg-slate-200 text-slate-400"
                        }`}>
                          <CheckCircle2 className={`w-2.5 h-2.5 ${step.done ? "block" : "hidden"}`} />
                        </span>
                        <div>
                          <h5 className={`font-bold text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.name}</h5>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Authority Mode Control Panel */}
              {authorityMode && (
                <Card className="border-primary/30 bg-primary/5 rounded-3xl p-6 shadow-sm space-y-4 animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-extrabold text-foreground">⚡ Authority Dispatch Actions</h3>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Assign Officer</label>
                      <select
                        value={selectedOfficer}
                        onChange={(e) => setSelectedOfficer(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus-visible:outline-none"
                      >
                        <option value="Officer Marcus Vance">Officer Marcus Vance</option>
                        <option value="Officer Sarah Jenkins">Officer Sarah Jenkins</option>
                        <option value="Officer David Miller">Officer David Miller</option>
                        <option value="Officer Elena Rostova">Officer Elena Rostova</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Set SLA Limit</label>
                      <select
                        value={selectedSla}
                        onChange={(e) => setSelectedSla(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus-visible:outline-none"
                      >
                        <option value="24 Hours">24 Hours</option>
                        <option value="48 Hours">48 Hours</option>
                        <option value="72 Hours">72 Hours</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Resolution Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus-visible:outline-none"
                      >
                        <option value="Pending">Pending Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved (Complete)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={handleAuthorityUpdate}
                      className="bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-black px-6 h-10 shadow-md shadow-primary/15"
                    >
                      Update Work Order & Dispatch
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          ) : searched ? (
            <div className="text-center p-12 border border-dashed border-border/60 rounded-3xl bg-white/40">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100/50 text-red-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-foreground">No Complaint Found</h3>
              <p className="text-sm text-muted-foreground mt-1">We couldn't find any report matching ID <strong>{searchId}</strong>. Please check and try again.</p>
            </div>
          ) : (
            <div className="text-center p-12 border border-dashed border-border/60 rounded-3xl bg-white/40">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 animate-bounce">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-foreground">Awaiting Submission ID</h3>
              <p className="text-sm text-muted-foreground mt-1">Type in your code above or select one from your recent submissions list.</p>
            </div>
          )}
        </div>

        {/* List of "Your Reports" sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/75 backdrop-blur-sm rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Your Reports</CardTitle>
              <CardDescription>Recently submitted complaints in this device's browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border/50 rounded-2xl">
                  No complaints reported yet on this device.
                </div>
              ) : (
                recentReports.map((report) => (
                  <div 
                    key={report.id} 
                    onClick={() => {
                      setSearchId(report.id);
                      setActiveReport(report);
                    }}
                    className={`p-3.5 border rounded-2xl cursor-pointer hover:shadow-xs transition-all ${
                      searchId === report.id ? "bg-primary/5 border-primary" : "bg-white/60 border-border/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-mono font-bold text-primary">{report.id}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {report.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground text-xs line-clamp-1">{report.title}</h4>
                    <span className="text-[10px] text-muted-foreground mt-1 block">{report.date}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const [authorityMode, setAuthorityMode] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const { user, isSignedIn } = useUser();

  // Sync authorityMode with localStorage on mount
  useEffect(() => {
    const verified = localStorage.getItem("civic_authority_verified") === "true";
    if (verified) {
      setAuthorityMode(true);
    }
  }, []);

  const handleToggleAuthority = () => {
    if (authorityMode) {
      setAuthorityMode(false);
      localStorage.removeItem("civic_authority_verified");
    } else {
      setShowPinPrompt(true);
      setPinInput("");
      setPinError("");
    }
  };

  const handleVerifyPin = () => {
    if (pinInput === "1234") {
      setAuthorityMode(true);
      localStorage.setItem("civic_authority_verified", "true");
      setShowPinPrompt(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("Access Denied: Invalid Authority PIN.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Background glow path */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-3xl rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/15 blur-3xl rounded-full z-0 pointer-events-none" />

      {/* Header */}
      <header className="px-6 lg:px-8 h-20 flex items-center border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2 font-bold text-2xl text-primary animate-fade-in" href="/">
          <Leaf className="w-8 h-8 text-secondary-foreground" />
          CivicAI
        </Link>
        <nav className="ml-auto flex gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors animate-fade-in" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors animate-fade-in" href="/map">
            Live Issue Map
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors animate-fade-in" href="/tracker">
            Track Issue
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
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading tracking system...</p>
          </div>
        }>
          <TrackerContent 
            authorityMode={authorityMode} 
            setAuthorityMode={setAuthorityMode}
          />
        </Suspense>
      </main>

      <Footer />

      {/* PIN Verification Modal */}
      {showPinPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <Card className="w-full max-w-sm border-primary/20 bg-card/95 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-4 mx-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-bounce">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground">Authority Access</h3>
              <p className="text-xs text-muted-foreground">Enter the 4-digit security PIN to access dispatch controls.</p>
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ""));
                  setPinError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
                className="text-center text-xl tracking-[1em] h-12 rounded-xl focus-visible:ring-primary/50 font-mono"
              />
              {pinError && (
                <p className="text-center text-[11px] text-red-600 font-bold">{pinError}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPinPrompt(false)}
                className="flex-1 rounded-xl text-xs font-bold h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyPin}
                className="flex-1 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold h-10"
              >
                Verify PIN
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
