"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leaf, ArrowRight, ShieldCheck, MapPin, BarChart3, Shield } from "lucide-react";
import Footer from "@/components/Footer";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function LandingPage() {
  const { user } = useUser();
  const router = useRouter();

  const [authorityMode, setAuthorityMode] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

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
      // Redirect to tracker page where authority dispatch options are available
      router.push("/tracker");
    } else {
      setPinError("Access Denied: Invalid Authority PIN.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-3xl rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/30 blur-[100px] rounded-full z-0 pointer-events-none" />

      <header className="px-6 lg:px-8 h-20 flex items-center border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2 font-bold text-2xl text-primary drop-shadow-sm" href="/">
          <Leaf className="w-8 h-8 text-secondary-foreground" />
          CivicAI
        </Link>
        <nav className="ml-auto flex gap-6 items-center">
          {/* Simulate Authority Portal button */}
          <Button 
            onClick={handleToggleAuthority}
            variant={authorityMode ? "default" : "outline"} 
            size="sm"
            className="rounded-full gap-2 text-xs font-extrabold mr-2 shadow-sm transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            {authorityMode ? "Leave Authority View" : "Simulate Authority Portal"}
          </Button>

          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/map">
            Live Issue Map
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/analytics">
            Transparency
          </Link>
          {!user ? (
            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="rounded-full shadow-sm">Log In</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 hover:bg-secondary/15 transition-all">
              <span className="text-xs font-bold text-foreground">
                Hi, {user.firstName || "Citizen"}
              </span>
              <UserButton />
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center lg:p-12 z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-fade-in">
            <ShieldCheck className="mr-2 h-4 w-4" /> Trusted by 50+ Municipalities
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
             Clean Streets. <br/>
            <span className="text-primary bg-clip-text drop-shadow-sm">Powered by AI.</span>
          </h1>
          
          <p className="max-w-[650px] text-muted-foreground md:text-xl/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed mb-10">
            Report potholes, broken streetlights, and environmental issues instantly. Our vision-AI tracks, categorizes, and directs them to the right officials automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/report">
              <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-primary text-primary-foreground">
                Report an Issue <ArrowRight className="ml-2 w-5 h-5"/>
              </Button>
            </Link>
            <Link href="/tracker">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg border-primary/20 hover:bg-primary/5 transition-all backdrop-blur-sm hover:scale-105">
                Track status
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg text-muted-foreground hover:text-primary transition-all">
                View Resolution Data
              </Button>
            </Link>
          </div>
        </div>

        {/* What You Can Report Section */}
        <div className="w-full max-w-5xl mt-32 text-left">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">What Can You Report?</h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
              Raise reports for any of the following issues to help our municipal teams restore and preserve our shared environment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm p-6 hover:border-primary/40 transition-all hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <span className="text-3xl mb-4 block">🌱</span>
                <h4 className="font-bold text-lg text-foreground mb-2">Environmental</h4>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Pollution or threats to natural habitats and local ecosystems.
                </p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 border-t border-border/20 pt-3">
                <li className="flex items-center gap-1.5">• Chemical & industrial spills</li>
                <li className="flex items-center gap-1.5">• Water body contamination</li>
                <li className="flex items-center gap-1.5">• Air quality hazards</li>
              </ul>
            </Card>

            <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm p-6 hover:border-primary/40 transition-all hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <span className="text-3xl mb-4 block">🗑️</span>
                <h4 className="font-bold text-lg text-foreground mb-2">Sanitation</h4>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Waste accumulation, public hygiene issues, and littering.
                </p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 border-t border-border/20 pt-3">
                <li className="flex items-center gap-1.5">• Illegal waste dumping</li>
                <li className="flex items-center gap-1.5">• Overflowing public garbage</li>
                <li className="flex items-center gap-1.5">• Hazardous waste disposal</li>
              </ul>
            </Card>

            <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm p-6 hover:border-primary/40 transition-all hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <span className="text-3xl mb-4 block">🚧</span>
                <h4 className="font-bold text-lg text-foreground mb-2">Infrastructure</h4>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Damage to roads, public lighting, and structural safety.
                </p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 border-t border-border/20 pt-3">
                <li className="flex items-center gap-1.5">• Potholes & cracked roads</li>
                <li className="flex items-center gap-1.5">• Broken streetlights</li>
                <li className="flex items-center gap-1.5">• Damaged sidewalks</li>
              </ul>
            </Card>

            <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm p-6 hover:border-primary/40 transition-all hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <span className="text-3xl mb-4 block">🌳</span>
                <h4 className="font-bold text-lg text-foreground mb-2">Green Spaces</h4>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Issues concerning parks, trees, and public green areas.
                </p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 border-t border-border/20 pt-3">
                <li className="flex items-center gap-1.5">• Obstructions from fallen trees</li>
                <li className="flex items-center gap-1.5">• Park facility vandalism</li>
                <li className="flex items-center gap-1.5">• Unmaintained public lawns</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mt-24">
          <div className="flex flex-col items-center p-6 bg-card rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
             <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-2">Pinpoint Tech</h3>
             <p className="text-muted-foreground text-sm">Precise geolocation drops ensure city workers find the exact problem.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
             <div className="h-16 w-16 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-2">Eco-Categorization</h3>
             <p className="text-muted-foreground text-sm">Gemini AI evaluates the ecological impact and automatically sets the severity priority.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
             <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-2">Live Progress</h3>
             <p className="text-muted-foreground text-sm">Total transparency. Track real-time repair metrics from city agencies.</p>
          </div>
        </div>
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
