"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Star, CheckCircle, Upload, ArrowLeft, Leaf, ShieldCheck, UserCheck } from "lucide-react";
import Footer from "@/components/Footer";
import { UserButton, useUser } from "@clerk/nextjs";

interface Leader {
  rank: number;
  name: string;
  points: number;
  badge: string;
  isCurrentUser?: boolean;
}

interface VerificationTask {
  id: string;
  title: string;
  category: string;
  resolvedBy: string;
  date: string;
}

export default function LeaderboardPage() {
  const { user, isSignedIn } = useUser();
  // Gamification states stored in localStorage for persistence
  const [userPoints, setUserPoints] = useState<number>(1150);
  const [verifiedTasks, setVerifiedTasks] = useState<string[]>([]);
  const [showVerifyModal, setShowVerifyModal] = useState<VerificationTask | null>(null);
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

  const tasksToVerify: VerificationTask[] = [
    { id: "REP-1025", title: "Illegal Dumping in Green Belt", category: "Sanitation", resolvedBy: "Officer Marcus Vance", date: "3 hrs ago" },
    { id: "REP-1024", title: "Fallen Tree Branch", category: "Debris", resolvedBy: "Officer Sarah Jenkins", date: "1 day ago" },
    { id: "REP-1029", title: "Broken Streetlight on Park Lane", category: "Infrastructure", resolvedBy: "Officer David Miller", date: "2 days ago" },
  ].filter(t => !verifiedTasks.includes(t.id));

  // Dynamic ranking list
  const baseLeaders: Omit<Leader, "rank">[] = [
    { name: "Sarah J.", points: 2450, badge: "Community Hero" },
    { name: "Mike T.", points: 1980, badge: "Gold Citizen" },
    { name: "Alex W.", points: 1540, badge: "Silver Citizen" },
    { name: "You (Priya M.)", points: userPoints, badge: userPoints > 1500 ? "Silver Citizen" : "Active Reporter", isCurrentUser: true },
    { name: "John D.", points: 850, badge: "Helpful Neighbor" },
  ];

  // Sort leaders by points and assign ranks
  const leaders: Leader[] = baseLeaders
    .sort((a, b) => b.points - a.points)
    .map((leader, index) => ({
      ...leader,
      rank: index + 1
    }));

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
    }, 1500);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-slate-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-700" />;
      default: return <Star className="w-5 h-5 text-primary/40" />;
    }
  };

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
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/map">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-primary animate-pulse" /> Civic Honor & Leaderboard
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Earn XP and badges by verifying resolved issues, submitting clean reports, and participating in eco-drives.
              </p>
            </div>
            <Card className="rounded-2xl border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Your Score</div>
                <div className="text-xl font-extrabold text-primary">{userPoints} XP</div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mt-4 items-start">
            {/* Left 2 cols: Leaderboard Table */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50 bg-card/75 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Top Performing Citizens</CardTitle>
                  <CardDescription>Rankings updated in real-time based on verified community actions.</CardDescription>
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
                          {getRankIcon(leader.rank)}
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

            {/* Right 1 col: Verification Tasks */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-border/50 bg-card/75 backdrop-blur-sm rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" /> Verify Resolutions
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
        </div>
      </main>

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

      <Footer />
    </div>
  );
}
