"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DynamicMapPicker from "@/components/DynamicMap";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ReportIssuePage() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Road Pothole");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      // Prepend selected category to help the AI categorize accurately
      formData.append("description", `[Type: ${category}] ${description}`);
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("http://localhost:3001/ai/analyze", {
        method: "POST",
        body: formData, // Automatically sets multipart/form-data
      });

      const data = await res.json();
      setAiResult(data);

      // Generate Submission ID
      const newId = "REP-" + Math.floor(1000 + Math.random() * 9000);
      setSubmittedId(newId);

      // Persist in localStorage for Tracker page
      const newReport = {
        id: newId,
        title: title || `${category} Issue`,
        category: category,
        description: description,
        status: "Pending",
        date: "Just now",
        department: data.department || "AI Triage Bureau",
        severity: data.severity || "Medium"
      };

      const saved = localStorage.getItem("user_submitted_reports");
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newReport);
      localStorage.setItem("user_submitted_reports", JSON.stringify(list));

    } catch (error) {
      console.error("AI Analysis failed", error);
      alert("Submission failed. The backend server might be offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedId(null);
    setTitle("");
    setDescription("");
    setImage(null);
    setLocation(null);
    setAiResult(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Glow path */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-3xl rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/15 blur-3xl rounded-full z-0 pointer-events-none" />

      {submittedId ? (
        <Card className="w-full max-w-2xl shadow-2xl border-emerald-550/20 bg-card/85 backdrop-blur-md rounded-3xl relative z-10 p-6 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-pulse">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Issue Reported Successfully!</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Thank you for contributing to your community. Our AI has triaged and routed your issue to the municipal department.
            </p>
          </div>

          <div className="p-5 bg-emerald-50/70 border border-emerald-100 rounded-2xl max-w-md mx-auto space-y-3.5">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Tracking Code</span>
              <div className="text-3xl font-mono font-black text-emerald-800 tracking-wider mt-1">{submittedId}</div>
            </div>

            {aiResult && (
              <div className="pt-3 border-t border-emerald-100 grid grid-cols-2 gap-3 text-xs text-emerald-950 font-semibold">
                <div className="bg-white/60 p-2.5 rounded-xl border border-emerald-100/50">
                  <span className="text-[9px] text-muted-foreground block mb-0.5">Assigned Dept</span>
                  {aiResult.department}
                </div>
                <div className="bg-white/60 p-2.5 rounded-xl border border-emerald-100/50">
                  <span className="text-[9px] text-muted-foreground block mb-0.5">Estimated Priority</span>
                  {aiResult.severity}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
            <Link href={`/tracker?id=${submittedId}`} className="flex-1">
              <Button className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white font-bold h-11">
                Track Status
              </Button>
            </Link>
            <Button onClick={handleReset} variant="outline" className="flex-1 rounded-xl border-border font-bold h-11">
              Report Another Issue
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="w-full max-w-2xl shadow-xl border-primary/20 bg-card/80 backdrop-blur-md rounded-3xl relative z-10">
          <CardHeader className="pb-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-extrabold text-foreground">Report a Civic Issue</CardTitle>
              <Link href="/">
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                  Cancel
                </Button>
              </Link>
            </div>
            <CardDescription className="text-base text-muted-foreground mt-2">
              Help your community by reporting issues. Our AI will automatically categorize and route this to the correct department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="category">Issue Type</Label>
                <select 
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl border border-input bg-background/50 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:border-primary/50 transition-all font-sans"
                >
                  <option value="Road Pothole">Road Pothole</option>
                  <option value="Sewer Blockage">Sewer Blockage</option>
                  <option value="Streetlight Issue">Streetlight Issue / Power Outage</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Issue Summary</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Deep pothole on Main Street" 
                  value={title}
                  onChange={(e: any) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the issue, any hazards it poses, etc." 
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required Media</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-muted-foreground bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors">
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="file-upload" 
                      accept="image/*"
                      onChange={(e: any) => {
                        if (e.target.files?.[0]) setImage(e.target.files[0]);
                      }}
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <span className="text-sm font-bold text-primary">
                        {image ? image.name : "Click to upload image"}
                      </span>
                      <span className="text-xs mt-1 text-muted-foreground">Accepts PNG, JPG (max. 5MB)</span>
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location (Click to pin)</Label>
                  <DynamicMapPicker onLocationSet={(lat, lng) => setLocation({lat, lng})} />
                  {location && (
                    <p className="text-xs text-green-600 font-medium">Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing AI Analysis...</> : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
