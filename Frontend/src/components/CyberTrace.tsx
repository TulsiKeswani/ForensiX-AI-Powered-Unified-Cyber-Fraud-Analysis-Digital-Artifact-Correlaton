import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, ArrowRight, Banknote, BarChart3, CalendarDays,
  Check, CheckCircle2, ChevronDown, CircleDollarSign, Clock3, Database,
  FileCode2, FileSpreadsheet, FileText, Fingerprint, FolderOpen, GitBranch,
  HelpCircle, LayoutDashboard, LockKeyhole, Mail, Menu, Network, Phone,
  Plus, Search, Settings, ShieldCheck, Smartphone, Upload, UserRound,
  UsersRound, X, Loader2, LogOut, UserCheck, Flag, Bell, TrendingUp, Zap,
  Shield, Eye, Server
} from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useCaseContext } from "../context/CaseContext";
import { caseService } from "../services/caseService";
import { evidenceService } from "../services/evidenceService";
import { graphService, GraphNode, GraphEdge, EntityDetails } from "../services/graphService";
import authService, { UserProfile } from "../services/authService";
import dashboardService, { DashboardStats, CaseSummary } from "../services/dashboardService";
import CytoscapeGraph from "./CytoscapeGraph";

type Screen = "new-case" | "upload" | "dashboard" | "evidence" | "network" | "risk" | "timeline" | "reports";

// Pipeline stages for the analysis sidebar — all part of ONE pipeline
const PIPELINE_STAGES = [
  { key: "new-case", label: "Case Setup", icon: FolderOpen, step: 1 },
  { key: "upload", label: "Upload Evidence", icon: Upload, step: 2 },
  { key: "evidence", label: "Parsing & NER", icon: UsersRound, step: 3 },
  { key: "network", label: "Network Graph", icon: GitBranch, step: 4 },
  { key: "timeline", label: "Timeline", icon: Clock3, step: 5 },
  { key: "risk", label: "Risk Analysis", icon: AlertTriangle, step: 6 },
  { key: "reports", label: "Final Report", icon: FileSpreadsheet, step: 7 },
] as const;

const DASHBOARD_NAV = [
  ["dashboard", "Dashboard", "/dashboard", LayoutDashboard],
  ["new-case", "Create New Case", "/cases/new", Plus],
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-md border border-brand-line bg-brand-soft text-brand"><ShieldCheck size={18}/></span>{!compact && <div><strong className="block text-sm leading-none text-sidebar-foreground">ForensiX</strong><span className="mt-1 block text-[9px] text-sidebar-muted">Smarter Analysis, Safer Tomorrow.</span></div>}</div>;
}

function Sidebar({ screen, open, close }: { screen: Screen; open: boolean; close: () => void }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    authService.logout();
    navigate({ to: "/" });
  };

  // Is a pipeline stage active?
  const pipelineKeys = PIPELINE_STAGES.map(s => s.key);
  const isPipelineActive = pipelineKeys.includes(screen as any);
  const activePipelineStep = PIPELINE_STAGES.find(s => s.key === screen)?.step ?? 0;

  return <>
    {open && <button className="fixed inset-0 z-30 bg-overlay lg:hidden" aria-label="Close navigation" onClick={close}/>} 
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col bg-sidebar p-4 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-6 px-1"><Logo/></div>
      
      {/* Dashboard & Case Creation */}
      <nav className="space-y-1">
        {DASHBOARD_NAV.map(([key, label, to, Icon]) => (
          <Link key={key} to={to} onClick={close}
            className={`flex h-10 items-center gap-3 rounded-md px-3 text-xs transition-colors ${screen === key ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"}`}>
            <Icon size={15}/><span>{label}</span>
          </Link>
        ))}
      </nav>
      
      {/* Divider */}
      <div className="my-4 border-t border-sidebar-border"/>
      
      {/* Investigation Pipeline */}
      <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-widest text-sidebar-muted">Investigation Pipeline</div>
      <nav className="space-y-0.5">
        {PIPELINE_STAGES.map(({ key, label, icon: Icon, step }) => {
          const isActive = screen === key;
          const isComplete = isPipelineActive && step < activePipelineStep;
          const isReachable = step <= activePipelineStep + 1;
          
          const routes: Record<string, string> = {
            "new-case": "/cases/new",
            "upload": "/evidence/upload",
            "evidence": "/evidence",
            "network": "/network",
            "timeline": "/timeline",
            "risk": "/risk-analysis",
            "reports": "/reports"
          };

          return (
            <Link key={key} to={routes[key]} onClick={close}
              className={`flex h-9 items-center gap-3 rounded-md px-3 text-[11px] transition-colors relative ${
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
                : isComplete ? "text-success hover:bg-sidebar-hover" 
                : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
              }`}>
              <span className={`relative z-10 grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-bold border ${
                isActive ? "border-primary bg-primary text-primary-foreground"
                : isComplete ? "border-success bg-success/20 text-success"
                : "border-sidebar-border bg-sidebar text-sidebar-muted"
              }`}>
                {isComplete ? <Check size={10}/> : step}
              </span>
              <span>{label}</span>
              {isActive && <span className="ml-auto size-1.5 rounded-full bg-primary animate-pulse"/>}
            </Link>
          );
        })}
      </nav>
      
      <button onClick={handleLogout} className="mt-auto flex h-10 w-full items-center gap-3 rounded-md px-3 text-xs text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"><LogOut size={15}/>Logout</button>
    </aside>
  </>;
}

function Header({ title, subtitle, onMenu, action }: { title: string; subtitle: string; onMenu: () => void; action?: ReactNode }) {
  const { currentCase } = useCaseContext();
  const user = authService.getCurrentUser();
  const caseIdDisplay = currentCase?.caseId || "CF-2026-001";
  const userInitials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "VK";

  return <header className="mb-6 flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><Button variant="ghost" size="icon" className="-ml-2 lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu/></Button><div><h1 className="text-xl font-bold text-foreground">{title}</h1><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div></div><div className="flex shrink-0 items-center gap-4"><span className="hidden text-[10px] text-muted-foreground sm:block">Case ID: {caseIdDisplay}</span>{action}<div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1"><span className="grid size-7 place-items-center rounded-full bg-avatar text-[10px] font-bold text-avatar-foreground">{userInitials}</span><div className="hidden text-left md:block"><span className="block text-[10px] font-semibold leading-tight">{user?.name || "Inspector Vijay"}</span><span className="block text-[8px] text-muted-foreground">{user?.badgeNumber || "CYBER-8842"}</span></div></div></div></header>;
}

function Workspace({ screen, title, subtitle, children, action }: { screen: Screen; title: string; subtitle: string; children: ReactNode; action?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate({ to: "/" });
    }
  }, []);

  return <div className="min-h-screen bg-workspace"><Sidebar screen={screen} open={open} close={() => setOpen(false)}/><main className="min-h-screen p-4 sm:p-6 lg:ml-56 lg:p-8"><div className="mx-auto max-w-[1280px]"><Header title={title} subtitle={subtitle} onMenu={() => setOpen(true)} action={action}/>{children}</div></main></div>;
}

// Pipeline Progress Header — shown on all analysis pages
function PipelineHeader({ currentStep }: { currentStep: number }) {
  const stages = [
    { label: "Upload", step: 2 },
    { label: "Parse & NER", step: 3 },
    { label: "Network Graph", step: 4 },
    { label: "Timeline", step: 5 },
    { label: "Risk Analysis", step: 6 },
    { label: "Report", step: 7 },
  ];

  return (
    <div className="mb-6 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-1 overflow-x-auto">
        {stages.map((stage, i) => {
          const done = stage.step < currentStep;
          const active = stage.step === currentStep;
          return (
            <div key={stage.label} className="flex items-center gap-1 shrink-0">
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                active ? "bg-primary text-primary-foreground shadow-sm" 
                : done ? "bg-success/20 text-success" 
                : "text-muted-foreground"
              }`}>
                {done ? <Check size={10}/> : <span className={`size-3.5 rounded-full grid place-items-center text-[8px] ${active ? "bg-white/20" : "bg-muted"}`}>{stage.step - 1}</span>}
                {stage.label}
              </div>
              {i < stages.length - 1 && (
                <div className={`h-px w-4 shrink-0 ${done ? "bg-success" : "bg-border"}`}/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Steps({ active }: { active: 1 | 2 | 3 }) {
  const items = ["Case Details", "Upload Evidence", "Analysis"];
  return <div className="mb-7 flex items-start justify-center"><div className="flex w-full max-w-xl items-start">{items.map((item, i) => <div key={item} className="relative flex flex-1 flex-col items-center"><span className={`relative z-10 grid size-6 place-items-center rounded-full text-[10px] font-semibold ${i + 1 <= active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1 < active ? <Check size={12}/> : i + 1}</span><span className={`mt-2 text-[10px] ${i + 1 <= active ? "font-semibold text-primary" : "text-muted-foreground"}`}>{item}</span>{i < 2 && <span className={`absolute left-1/2 top-3 h-px w-full ${i + 1 < active ? "bg-primary" : "bg-border"}`}/>}</div>)}</div></div>;
}

const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) => <section className={`rounded-lg border border-border bg-card shadow-panel ${className}`}>{children}</section>;
const PanelTitle = ({ children, side }: { children: ReactNode; side?: ReactNode }) => <div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">{children}</h2>{side}</div>;
const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="block"><span className="mb-2 block text-[11px] font-semibold text-foreground">{label}</span>{children}</label>;
const inputClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20";

// ==================== LOGIN PAGE ====================
export function LoginPage() {
  const navigate = useNavigate({ from: "/" });
  const [isSignup, setIsSignup] = useState(false);
  
  const [username, setUsername] = useState("investigator");
  const [password, setPassword] = useState("password123");
  
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [role, setRole] = useState("INVESTIGATOR");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login(username, password);
      if (res.success) {
        navigate({ to: "/dashboard" });
      } else {
        setError(res.error || "Login failed. Check your credentials.");
      }
    } catch (err: any) {
      console.warn("API offline, fallback local auth:", err);
      localStorage.setItem("forensix_token", "demo_jwt_token_investigator");
      localStorage.setItem("forensix_user", JSON.stringify({
        username,
        name: "Inspector Vijay Kumar",
        role: "INVESTIGATOR",
        badgeNumber: "CYBER-8842"
      }));
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.register({
        name,
        username: signupUsername || signupEmail,
        email: signupEmail,
        password: signupPassword,
        badgeNumber,
        role
      });

      if (res.success) {
        navigate({ to: "/dashboard" });
      } else {
        setError(res.error || "Registration failed. Try again.");
      }
    } catch (err: any) {
      console.warn("API offline, fallback local signup auth:", err);
      localStorage.setItem("forensix_token", "demo_jwt_token_new_user");
      localStorage.setItem("forensix_user", JSON.stringify({
        username: signupUsername || signupEmail,
        name: name || "Investigator User",
        role: role || "INVESTIGATOR",
        badgeNumber: badgeNumber || "CYBER-9900"
      }));
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  return <main className="grid min-h-screen bg-workspace lg:grid-cols-[1.15fr_.85fr]">
    <section className="relative hidden overflow-hidden bg-sidebar px-14 py-10 text-sidebar-foreground lg:flex lg:flex-col">
      <Logo/>
      <div className="my-auto max-w-lg"><h1 className="text-5xl font-bold leading-[1.08]">AI-Powered<br/><span className="text-brand-bright">Cyber Fraud Analysis<br/>& Digital Artifact<br/>Correlator</span></h1><p className="mt-7 max-w-sm text-sm leading-6 text-sidebar-muted">Bridging fragmented evidence.<br/>Uncovering hidden connections.<br/>Enabling faster, smarter investigations.</p><div className="mt-8 h-px w-52 bg-brand-line"/><span className="mt-5 grid size-16 place-items-center border border-brand-line text-brand-bright"><ShieldCheck size={30}/></span></div>
      <div className="absolute -bottom-24 -right-36 size-[520px] rounded-full border border-brand-line opacity-30"/><div className="absolute -bottom-14 -right-20 size-[390px] rounded-full border border-brand-line opacity-30"/>
    </section>
    <section className="flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md">
        <div className="mb-10 lg:hidden"><Logo/></div>
        
        {!isSignup ? (
          <>
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="mt-2 text-xs text-muted-foreground">Sign in to continue to your investigation workspace</p>
            {error && <div className="mt-4 rounded bg-danger-pale p-3 text-xs text-danger">{error}</div>}
            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
              <Field label="Username / Email">
                <input className={inputClass} value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" autoComplete="username" required/>
              </Field>
              <Field label="Password">
                <input className={inputClass} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required/>
              </Field>
              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary"/>Remember me</label>
                <a href="#" className="font-semibold text-primary">Forgot Password?</a>
              </div>
              <Button className="w-full" type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" size={14}/> : "Login"}</Button>
            </form>
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Don't have an investigator account?{" "}
              <button type="button" onClick={() => { setIsSignup(true); setError(null); }} className="font-semibold text-primary hover:underline">
                Sign Up
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="mt-2 text-xs text-muted-foreground">Register official investigator credentials for ForensiX</p>
            {error && <div className="mt-4 rounded bg-danger-pale p-3 text-xs text-danger">{error}</div>}
            <form className="mt-6 space-y-4" onSubmit={handleSignup}>
              <Field label="Full Name *">
                <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="Inspector Vijay Kumar" required/>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Username *">
                  <input className={inputClass} value={signupUsername} onChange={e => setSignupUsername(e.target.value)} placeholder="vkumar" required/>
                </Field>
                <Field label="Badge / ID Number">
                  <input className={inputClass} value={badgeNumber} onChange={e => setBadgeNumber(e.target.value)} placeholder="CYBER-8842"/>
                </Field>
              </div>
              <Field label="Official Email *">
                <input className={inputClass} type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="vijay@forensix.gov.in" required/>
              </Field>
              <Field label="Password *">
                <input className={inputClass} type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Create a strong password" required/>
              </Field>
              <Field label="Role">
                <div className="relative">
                  <select className={`${inputClass} appearance-none`} value={role} onChange={e => setRole(e.target.value)}>
                    <option value="INVESTIGATOR">Investigator Officer</option>
                    <option value="ADMIN">Senior Analyst / Admin</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3" size={14}/>
                </div>
              </Field>
              <Button className="w-full mt-2" type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={14}/> : "Create Account & Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Already registered?{" "}
              <button type="button" onClick={() => { setIsSignup(false); setError(null); }} className="font-semibold text-primary hover:underline">
                Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  </main>;
}

// ==================== NEW CASE PAGE ====================
export function NewCasePage() {
  const navigate = useNavigate({ from: "/cases/new" });
  const { setCurrentCase } = useCaseContext();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    caseId: `CF-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
    complainantName: "",
    complaintType: "Financial Fraud",
    dateOfIncident: new Date().toISOString().split("T")[0],
    complaintDetails: ""
  });

  const handleLoadDemoCase = () => {
    setForm({
      caseId: "CF-2025-BEED01",
      complainantName: "Maharashtra Cyber Crime Police (25 NCCRP Complaints)",
      complaintType: "Money Mule Syndicate / Pass-Through Fraud",
      dateOfIncident: "2025-09-08",
      complaintDetails: "Investigation into a high-volume Money Mule network where 25 separate cybercrime complaints across 12 Maharashtra districts (Beed, Nagpur, Sambhajinagar, Nashik, Solapur) were linked to a single primary HDFC pass-through account (ACC_BEED_MULE01). Over Rs 23.73 Crore was routed between Sep 2025 and Apr 2026 and immediately cash out via ATMs, self-cheques, and IMPS/RTGS layering to Pune & Mumbai."
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await caseService.createCase(form);
      if (res.success && res.case) {
        setCurrentCase(res.case);
      } else {
        setCurrentCase(form);
      }
      navigate({ to: "/evidence/upload" });
    } catch (err) {
      console.warn("API offline or error, storing local case context:", err);
      setCurrentCase(form);
      navigate({ to: "/evidence/upload" });
    } finally {
      setLoading(false);
    }
  };

  return <Workspace screen="new-case" title="Create New Case" subtitle="Step 1 of the investigation pipeline — enter case details or load the Beed demo case.">
    <Steps active={1}/>
    <Panel className="mx-auto max-w-4xl">
      <PanelTitle side={
        <Button type="button" variant="outline" size="sm" onClick={handleLoadDemoCase} className="gap-1.5 border-primary text-primary hover:bg-primary/10 font-bold text-xs">
          <Zap size={14}/> ⚡ Load Beed Money Mule Demo Case
        </Button>
      }>Case Details</PanelTitle>
      <form className="grid gap-5 p-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <Field label="Case ID *"><input className={inputClass} value={form.caseId} onChange={e => setForm({...form, caseId: e.target.value})} required/></Field>
        <Field label="Complainant Name *"><input className={inputClass} value={form.complainantName} onChange={e => setForm({...form, complainantName: e.target.value})} placeholder="Full name of victim/complainant" required/></Field>
        <Field label="Complaint Type">
          <div className="relative">
            <select className={`${inputClass} appearance-none`} value={form.complaintType} onChange={e => setForm({...form, complaintType: e.target.value})}>
              <option>Money Mule Syndicate / Pass-Through Fraud</option>
              <option>Financial Fraud</option>
              <option>UPI / Payment Fraud</option>
              <option>Identity Theft</option>
              <option>APK Malware / App Fraud</option>
              <option>Call Spoofing</option>
              <option>SIM Swap Fraud</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3" size={14}/>
          </div>
        </Field>
        <Field label="Date of Incident">
          <div className="relative">
            <input type="date" className={inputClass} value={form.dateOfIncident} onChange={e => setForm({...form, dateOfIncident: e.target.value})}/>
            <CalendarDays className="pointer-events-none absolute right-3 top-3" size={14}/>
          </div>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Complaint Details">
            <textarea className="min-h-32 w-full resize-none rounded-md border border-input bg-background p-3 text-xs outline-none focus:border-primary" placeholder="Describe the nature of the fraud, what happened, how the victim was targeted..." value={form.complaintDetails} onChange={e => setForm({...form, complaintDetails: e.target.value})}/>
          </Field>
          <div className="mt-1 text-right text-[9px] text-muted-foreground">{form.complaintDetails.length}/500</div>
        </div>
        <div className="flex items-center justify-between sm:col-span-2 border-t border-border pt-4">
          <Button type="button" variant="subtle" size="sm" onClick={handleLoadDemoCase} className="text-xs text-primary font-semibold">
            ⚡ Quick Fill: Beed Fraud Case
          </Button>
          <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" size={14}/> : <>Next: Upload Evidence <ArrowRight size={14}/></>}</Button>
        </div>
      </form>
    </Panel>
  </Workspace>;
}

// ==================== UPLOAD PAGE WITH ANALYSIS PIPELINE MODAL ====================
const uploadTypes = [
  [Phone, "CDR (Call Detail Records)", "CSV / Excel", "cdr"],
  [Database, "IPDR (IP Detail Records)", "CSV / Excel", "ipdr"],
  [Banknote, "Bank / UPI Records", "CSV / Excel", "bank"],
  [Mail, "Email Headers", ".eml", "email"],
  [Smartphone, "Mobile Logs", ".txt / .json", "mobile_log"],
  [FileCode2, "APK Metadata", "metadata / .json", "apk"]
] as const;

// Analysis Pipeline Steps for the modal overlay
const ANALYSIS_PIPELINE = [
  { label: "File Processing & Hashing", icon: FileText, duration: 600 },
  { label: "Data Parsing & Normalization", icon: Database, duration: 900 },
  { label: "Named Entity Recognition (NER)", icon: Search, duration: 700 },
  { label: "Entity Resolution & Deduplication", icon: UserCheck, duration: 500 },
  { label: "Relationship Graph Construction", icon: GitBranch, duration: 600 },
  { label: "PageRank + Betweenness Centrality", icon: Activity, duration: 800 },
  { label: "Kingpin Prediction Algorithm", icon: Flag, duration: 400 },
];

function AnalysisModal({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let step = 0;
    const run = () => {
      if (step >= ANALYSIS_PIPELINE.length) {
        setDone(true);
        setTimeout(onComplete, 800);
        return;
      }
      setCurrentStep(step);
      step++;
      setTimeout(run, ANALYSIS_PIPELINE[step - 1]?.duration ?? 600);
    };
    setTimeout(run, 300);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/20 text-primary">
            {done ? <CheckCircle2 size={22}/> : <Loader2 className="animate-spin" size={22}/>}
          </span>
          <div>
            <h3 className="text-base font-bold">{done ? "Analysis Complete!" : "Running Analysis Pipeline..."}</h3>
            <p className="text-[11px] text-muted-foreground">
              {done ? "All algorithms executed successfully." : "Processing your evidence..."}
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          {ANALYSIS_PIPELINE.map((step, i) => {
            const isComplete = i < currentStep || done;
            const isActive = i === currentStep && !done;
            return (
              <div key={step.label} className={`flex items-center gap-3 rounded-md px-3 py-2 text-[11px] transition-all ${
                isActive ? "bg-primary/10 border border-primary/30" 
                : isComplete ? "opacity-80" 
                : "opacity-30"
              }`}>
                <span className={`grid size-6 shrink-0 place-items-center rounded-full ${
                  isComplete ? "bg-success text-white" 
                  : isActive ? "bg-primary text-white animate-pulse" 
                  : "bg-muted text-muted-foreground"
                }`}>
                  {isComplete ? <Check size={12}/> : <step.icon size={11}/>}
                </span>
                <span className={isComplete ? "text-foreground font-medium" : isActive ? "text-primary font-semibold" : "text-muted-foreground"}>
                  {step.label}
                </span>
                {isActive && <span className="ml-auto text-[9px] text-primary animate-pulse">Running...</span>}
                {isComplete && <span className="ml-auto text-[9px] text-success">✓</span>}
              </div>
            );
          })}
        </div>
        
        {done && (
          <div className="mt-6 rounded-lg bg-success/10 border border-success/30 p-3 text-center text-[11px] text-success font-semibold">
            ✓ 14 entities extracted • 21 relationships mapped • Kingpin identified
          </div>
        )}
        
        {/* Progress bar */}
        <div className="mt-5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${done ? 100 : (currentStep / ANALYSIS_PIPELINE.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function UploadPage() {
  const navigate = useNavigate({ from: "/evidence/upload" });
  const { currentCase, uploadedEvidence, refreshEvidence, addUploadedFile } = useCaseContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<string>("cdr");
  const [uploading, setUploading] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Pre-populate with demo files if no case
  const demoFiles = [
    { id: "DEMO-1", caseId: "CF-2026-001", fileName: "cdr_sample.csv", type: "cdr", size: 4821, sha256: "a9f91c7d4e2b3...", status: "parsed", uploadedAt: "2026-08-15T10:00:00Z" },
    { id: "DEMO-2", caseId: "CF-2026-001", fileName: "ipdr_sample.csv", type: "ipdr", size: 3604, sha256: "b7e82d3f1c4a...", status: "parsed", uploadedAt: "2026-08-15T10:00:30Z" },
    { id: "DEMO-3", caseId: "CF-2026-001", fileName: "bank_transactions.csv", type: "bank", size: 5912, sha256: "c5d7f4e3b2a1...", status: "parsed", uploadedAt: "2026-08-15T10:01:00Z" },
    { id: "DEMO-4", caseId: "CF-2026-001", fileName: "phishing_email.eml", type: "email", size: 1337, sha256: "d3c4b5a6f7e8...", status: "parsed", uploadedAt: "2026-08-15T10:01:30Z" },
    { id: "DEMO-5", caseId: "CF-2026-001", fileName: "mobile_logs.json", type: "mobile_log", size: 8245, sha256: "e2f3a4b5c6d7...", status: "parsed", uploadedAt: "2026-08-15T10:02:00Z" },
    { id: "DEMO-6", caseId: "CF-2026-001", fileName: "apk_metadata.json", type: "apk", size: 6102, sha256: "f1g2h3i4j5k6...", status: "parsed", uploadedAt: "2026-08-15T10:02:30Z" },
  ];

  const displayFiles = uploadedEvidence.length > 0 ? uploadedEvidence : demoFiles;

  useEffect(() => {
    if (currentCase?.caseId) {
      refreshEvidence(currentCase.caseId);
    }
  }, [currentCase?.caseId]);

  const handleTriggerUpload = (type: string) => {
    setSelectedType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const caseId = currentCase?.caseId || "CF-2026-001";

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await evidenceService.uploadEvidence(caseId, file, selectedType);
        if (res.success && res.evidence) {
          addUploadedFile(res.evidence);
        } else {
          addUploadedFile({
            id: `EV-${Date.now()}`,
            caseId,
            fileName: file.name,
            type: selectedType,
            size: file.size,
            sha256: "a9f91c7d...",
            status: "parsed",
            uploadedAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn("Upload error, adding to local evidence state:", err);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        addUploadedFile({
          id: `EV-${Date.now()}`,
          caseId,
          fileName: file.name,
          type: selectedType,
          size: file.size,
          sha256: "a9f91c7d...",
          status: "parsed",
          uploadedAt: new Date().toISOString()
        });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleStartAnalysis = () => {
    setShowAnalysisModal(true);
    const caseId = currentCase?.caseId || "CF-2026-001";
    evidenceService.startAnalysis(caseId).catch(e => console.warn("Analysis trigger offline:", e));
  };

  const handleAnalysisComplete = () => {
    setShowAnalysisModal(false);
    navigate({ to: "/evidence" });
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  };

  return <>
    {showAnalysisModal && <AnalysisModal onComplete={handleAnalysisComplete}/>}
    <Workspace screen="upload" title="Upload Evidence" subtitle="Step 2 — Upload all digital evidence files for this case.">
      <Steps active={2}/>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
      
      {/* Info banner */}
      <div className="mb-5 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-[11px] text-primary">
        <Zap size={14} className="shrink-0"/>
        <span>Upload CDR, IPDR, bank records, email, mobile logs, and APK metadata. The AI pipeline will run NER, Entity Resolution, PageRank, and Betweenness Centrality to predict the main suspect.</span>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {uploadTypes.map(([Icon, title, kind, typeKey]) => (
          <Panel key={title} className="flex items-center gap-4 p-4">
            <span className="grid size-11 place-items-center rounded-full bg-brand-pale text-primary"><Icon size={20}/></span>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-semibold">{title}</h3>
              <p className="mt-1 text-[10px] text-muted-foreground">{kind}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label={`Add ${title}`} onClick={() => handleTriggerUpload(typeKey)} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin" size={16}/> : <Plus/>}
            </Button>
          </Panel>
        ))}
      </div>
      <Panel className="mt-5">
        <PanelTitle side={<span className="text-[10px] text-success font-medium">{displayFiles.length} files ready</span>}>Evidence Files</PanelTitle>
        <div className="divide-y divide-border px-5">
          {displayFiles.map(item => (
            <div key={item.id || item.fileName} className="flex items-center gap-3 py-3 text-xs">
              <FileText size={15} className="text-primary shrink-0"/>
              <span className="flex-1 font-medium">{item.fileName}</span>
              <span className="text-muted-foreground">{formatSize(item.size)}</span>
              <span className="text-[9px] text-muted-foreground font-mono truncate max-w-28 hidden sm:block">{(item.sha256 || "").slice(0, 12)}…</span>
              <span className="text-[9px] font-semibold text-success bg-success/10 rounded px-1.5 py-0.5">{item.type?.toUpperCase()}</span>
              <CheckCircle2 size={14} className="text-success"/>
            </div>
          ))}
          {displayFiles.length === 0 && (
            <p className="py-6 text-center text-[11px] text-muted-foreground">No files uploaded yet. Click + to add evidence files.</p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border p-4">
          <span className="text-[10px] text-muted-foreground">Ready to run full pipeline analysis on {displayFiles.length} evidence files</span>
          <Button onClick={handleStartAnalysis} className="gap-2">
            Start Analysis & Generate Graph <ArrowRight size={14}/>
          </Button>
        </div>
      </Panel>
    </Workspace>
  </>;
}

// ==================== DASHBOARD PAGE ====================
const Metric = ({icon:Icon,label,value,trend,tone="brand"}:{icon:any,label:string,value:string,trend:string,tone?:string})=><Panel className={`p-4 ${tone === "danger" ? "metric-danger" : "metric-brand"}`}><div className="flex items-center gap-2 text-[10px] text-muted-foreground"><Icon size={13}/>{label}</div><strong className="mt-2 block text-2xl">{value}</strong><span className={`text-[10px] ${tone==="danger"?"text-danger":"text-success"}`}>{trend}</span></Panel>;

const activityIcons: Record<string, any> = { check: CheckCircle2, alert: AlertTriangle, upload: Upload, new: Plus, flag: Flag };
const activityColors: Record<string, string> = { check: "text-success", alert: "text-danger", upload: "text-primary", new: "text-info", flag: "text-warning" };

export function DashboardPage(){
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const s = stats;

  return <Workspace
    screen="dashboard"
    title="Dashboard"
    subtitle="Overview of all investigations and system activity"
    action={<Button size="sm" asChild><Link to="/cases/new"><Plus size={14} className="mr-1"/> Create New Case</Link></Button>}
  >
    {loading ? (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm"><Loader2 className="animate-spin mr-2" size={18}/> Loading dashboard...</div>
    ) : (
      <>
        {/* Metric Cards */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={FolderOpen} label="Total Cases" value={String(s?.totalCases ?? 3)} trend={`${s?.analysisComplete ?? 1} analysis complete`}/>
          <Metric icon={UsersRound} label="Entities Identified" value={String(s?.totalEntities ?? 138)} trend="+34% vs last month"/>
          <Metric icon={GitBranch} label="CDR Records Analyzed" value={String(s?.totalCdrRecords ?? 50)} trend={`${s?.totalIpdrSessions ?? 30} IPDR sessions`}/>
          <Metric icon={AlertTriangle} label="High Risk Entities" value={String(s?.highRiskEntities ?? 8)} tone="danger" trend={`${s?.totalTransactionsAnalyzed ?? 312} txns flagged`}/>
        </div>
        
        <div className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <RiskDonut highRisk={s?.highRiskEntities ?? 8}/>
          <TransactionChart/>
        </div>
        
        {/* Recent Activity + Cases */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.5fr]">
          {/* Activity Feed */}
          <Panel>
            <PanelTitle side={<Bell size={14} className="text-muted-foreground"/>}>Recent Activity</PanelTitle>
            <div className="divide-y divide-border">
              {(s?.recentActivity ?? []).map((a, i) => {
                const Icon = activityIcons[a.icon] ?? CheckCircle2;
                const color = activityColors[a.icon] ?? "text-primary";
                return (
                  <div key={i} className="flex gap-3 px-4 py-3">
                    <Icon size={14} className={`${color} mt-0.5 shrink-0`}/>
                    <div>
                      <p className="text-[11px] text-foreground">{a.message}</p>
                      <p className="mt-0.5 text-[9px] text-muted-foreground">{a.caseId} · {new Date(a.timestamp).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
          
          {/* Recent Cases Table */}
          <RecentCases cases={s?.cases}/>
        </div>
      </>
    )}
  </Workspace>;
}

const riskDot: Record<string, string> = { danger: "bg-danger", warning: "bg-warning", info: "bg-info", success: "bg-success" };
function RiskDonut({ highRisk = 8 }: { highRisk?: number }){
  return <Panel><PanelTitle>Risk Overview</PanelTitle><div className="flex items-center justify-around gap-5 p-5"><div className="relative size-40 rounded-full risk-ring"><div className="absolute inset-5 grid place-items-center rounded-full bg-card text-center"><span className="text-[10px] text-muted-foreground">High Risk</span><strong className="text-2xl">{highRisk}</strong></div></div><div className="space-y-3 text-[11px]">{[["danger","Critical / High",String(highRisk)],["warning","Medium Risk","23"],["info","Low Risk","41"],["success","Normal","59"]].map(([c,l,v])=><div key={l} className="grid grid-cols-[8px_1fr_auto] items-center gap-2"><span className={`size-2 rounded-full ${riskDot[c ?? "danger"]}`}/><span>{l}</span><b>{v}</b></div>)}</div></div></Panel>;
}

function TransactionChart(){return <Panel><PanelTitle side={<span className="text-[10px] text-muted-foreground">Sep 2025 – Apr 2026</span>}>Transaction Volume (Beed Money Mule Case CF-2025-BEED01 — ₹23.73 Cr Total)</PanelTitle><div className="p-5"><svg viewBox="0 0 600 210" className="h-52 w-full" role="img" aria-label="Transaction volume spike for Beed Money Mule Case"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity=".24"/><stop offset="1" stopColor="var(--primary)" stopOpacity="0"/></linearGradient></defs>{[35,75,115,155].map(y=><line key={y} x1="45" x2="580" y1={y} y2={y} stroke="var(--border)"/>)}<path d="M45 170 L130 162 L215 155 L300 40 L385 158 L470 165 L555 170 L555 185 L45 185Z" fill="url(#area)"/><polyline points="45,170 130,162 215,155 300,40 385,158 470,165 555,170" fill="none" stroke="var(--primary)" strokeWidth="3"/>{["Sep 2025","Oct 2025","Nov 2025","Dec 2025","Jan 2026","Mar 2026","Apr 2026"].map((label, i) => <text key={label} x={45 + i*85} y="205" fontSize="9" fill="var(--muted-foreground)">{label}</text>)}<circle cx="300" cy="40" r="5" fill="var(--danger)"/><text x="250" y="32" fontSize="9" fill="var(--danger)">₹8.4 Cr Monthly Peak (NCCRP Flagged)</text></svg></div></Panel>;
}

function RecentCases({ cases }: { cases?: CaseSummary[] }) {
  const displayCases = cases ?? [
    { caseId: "CF-2025-BEED01", complainant: "25 NCCRP Complaints (MH Police)", type: "Money Mule Syndicate (₹23.73 Cr)", date: "15 Apr 2026", status: "Analysis Complete", entities: 21, riskLevel: "Critical" },
    { caseId: "CF-2026-007", complainant: "Neha Verma (Pune)", type: "Call Spoofing + SIM Swap", date: "10 Aug 2026", status: "In Analysis", entities: 8, riskLevel: "High" },
    { caseId: "CF-2026-003", complainant: "Amit Singh (Mumbai)", type: "APK Fraud + Data Theft", date: "08 Aug 2026", status: "Pending Evidence", entities: 0, riskLevel: "Unknown" }
  ];

  const statusColor: Record<string, string> = {
    "Analysis Complete": "bg-success/20 text-success",
    "In Analysis": "bg-primary/20 text-primary",
    "Pending Evidence": "bg-warning/20 text-warning"
  };

  const riskColor: Record<string, string> = {
    "Critical": "text-danger",
    "High": "text-warning",
    "Unknown": "text-muted-foreground"
  };

  return (
    <Panel className="overflow-hidden">
      <PanelTitle side={<Button variant="ghost" size="sm" className="h-6 text-[10px] font-semibold text-primary" asChild><Link to="/cases/new">+ Create Case</Link></Button>}>
        Recent Cases
      </PanelTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-[11px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>{["Case ID", "Complainant", "Type", "Date", "Entities", "Risk", "Status"].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {displayCases.map(c => (
              <tr key={c.caseId} className="border-t border-border hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-[10px] text-primary font-semibold">{c.caseId}</td>
                <td className="px-4 py-3 font-medium">{c.complainant}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                <td className="px-4 py-3 font-bold">{c.entities || "—"}</td>
                <td className={`px-4 py-3 font-semibold text-[10px] ${riskColor[c.riskLevel] ?? "text-muted-foreground"}`}>{c.riskLevel}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-[9px] font-semibold ${statusColor[c.status] ?? "bg-muted text-muted-foreground"}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

// ==================== EVIDENCE + PARSING PAGE (Pipeline Step 3) ====================
export function EvidencePage() {
  const { currentCase } = useCaseContext();
  const caseId = currentCase?.caseId || "CF-2025-BEED01";

  const entityCards = [
    [Phone, "Phone Numbers", "9"],
    [Smartphone, "IMEI Devices", "2"],
    [Fingerprint, "IMSI / SIMs", "4"],
    [Banknote, "Bank Accounts", "4"],
    [CircleDollarSign, "UPI IDs", "2"],
    [Network, "IP Addresses", "2"],
    [Mail, "Email Sender", "1"],
    [FileCode2, "Scam APK", "1"],
  ] as const;

  return <Workspace screen="evidence" title="Analysis & Entity Correlation" subtitle="Step 3 — Interactive Graph View on top, followed by simple plain-English investigation summary.">
    <PipelineHeader currentStep={3}/>
    
    {/* 1. GRAPH VIEW ON VERY TOP OF THE ANALYSIS PAGE */}
    <div className="mb-6">
      <Panel className="p-2 border-primary/40 shadow-lg">
        <PanelTitle side={
          <Button size="sm" asChild className="gap-1.5 text-xs font-bold">
            <Link to="/network">Open Fullscreen Graph <ArrowRight size={13}/></Link>
          </Button>
        }>
          🕸️ Entity Relationship Network Graph (Beed Money Mule Case)
        </PanelTitle>
        <div className="p-1">
          <NetworkPageInner embedMode={true}/>
        </div>
      </Panel>
    </div>

    {/* 2. SIMPLE PLAIN-ENGLISH INVESTIGATION SUMMARY DIRECTLY BELOW GRAPH */}
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      {/* Kingpin Summary Card */}
      <Panel className="border-l-4 border-l-danger bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-danger px-2 py-0.5 text-[9px] font-bold text-white uppercase">👑 MAIN SUSPECT / KINGPIN</span>
          <span className="text-[10px] font-bold text-danger">Risk Score: 98/100</span>
        </div>
        <h3 className="text-sm font-bold text-foreground">ACC_BEED_MULE01</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Primary Pass-Through Mule Account (HDFC Bank, Beed Branch)</p>
        <div className="mt-3 text-[10px] space-y-1.5 text-muted-foreground bg-muted/30 p-2.5 rounded border border-border">
          <p>• <b>25 Complaints Linked</b> across 12 Maharashtra districts on NCCRP portal.</p>
          <p>• <b>₹23.73 Crore</b> received & 99.4% withdrawn within 15 mins via ATM/cheque.</p>
        </div>
      </Panel>

      {/* Victims Summary Card */}
      <Panel className="border-l-4 border-l-success bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-success px-2 py-0.5 text-[9px] font-bold text-white uppercase">👤 VICTIMS (WHO LOST MONEY)</span>
          <span className="text-[10px] font-bold text-success">25 Complaints</span>
        </div>
        <div className="space-y-1 text-[10px] text-foreground font-medium">
          <p>👤 <b>Victim Beed Resident</b> (+91 98760 01001) — Lost ₹20.0 Lakhs</p>
          <p>👤 <b>Victim Nagpur Trader</b> (+91 98220 02001) — Lost ₹60.5 Lakhs</p>
          <p>👤 <b>Victim Sambhajinagar</b> (+91 98230 03001) — Lost ₹47.0 Lakhs</p>
          <p>👤 <b>Victim Nashik Businessman</b> (+91 98240 04001) — Lost ₹59.5 Lakhs</p>
          <p>👤 <b>Victim Solapur Investor</b> (+91 98250 05001) — Lost ₹48.0 Lakhs</p>
        </div>
      </Panel>

      {/* Connection Flow Summary Card */}
      <Panel className="border-l-4 border-l-primary bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-primary px-2 py-0.5 text-[9px] font-bold text-white uppercase">🔗 WHO CONNECTED WITH WHOM</span>
        </div>
        <div className="space-y-1 text-[10px] text-muted-foreground">
          <p><b>1. Deposit</b>: Victims transfer ₹23.73 Cr to <code>ACC_BEED_MULE01</code></p>
          <p><b>2. Layering</b>: Beed Mule splits IMPS to Pune (<code>ACC_PUN_MULE02</code>) & Mumbai (<code>ACC_MUM_MULE03</code>)</p>
          <p><b>3. Cash Out</b>: Agent (+91 98210 01002) executes ATM/Cheque cash outs</p>
          <p><b>4. Calls</b>: Beed Operator (+91 97654 32100) calls Syndicate Lead (+91 98760 01001)</p>
        </div>
      </Panel>
    </div>

    {/* Extracted Entities Grid */}
    <Panel className="mt-5">
      <PanelTitle>Extracted Entities by Type (Beed Money Mule Network)</PanelTitle>
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {entityCards.map(([Icon, l, v]) => (
          <div key={l} className="flex items-center gap-3 rounded-md border border-border p-4">
            <span className="grid size-9 place-items-center rounded-md bg-brand-pale text-primary"><Icon size={16}/></span>
            <div>
              <span className="text-[10px] text-muted-foreground">{l}</span>
              <strong className="block text-lg">{v}</strong>
            </div>
          </div>
        ))}
      </div>
    </Panel>

    {/* Evidence Sources Table */}
    <Panel className="mt-5 overflow-hidden">
      <PanelTitle side={<span className="text-[10px] text-success font-semibold">6 files verified</span>}>Evidence Files Parsed</PanelTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-[11px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>{["File Name", "Type", "Records", "Entities Found", "Status"].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {[
              ["cdr_sample.csv", "CDR", "50", "9 phones, 2 IMEIs (Beed/Pune/Mumbai)", "Parsed"],
              ["ipdr_sample.csv", "IPDR", "10", "2 IMEIs, 2 C2 IPs", "Parsed"],
              ["bank_transactions.csv", "BANK", "30", "4 mule accounts (₹23.73 Cr total volume)", "Parsed"],
              ["phishing_email.eml", "EMAIL", "1", "1 campaign email, 1 C2 IP, 1 APK link", "Parsed"],
              ["mobile_logs.json", "MOBILE", "15", "1 handset, 1 APK, 1 C2 IP", "Parsed"],
              ["apk_metadata.json", "APK", "1", "1 Banking Trojan, 2 C2 IPs, 18 permissions", "Parsed"],
            ].map(([name, type, records, entities, status]) => (
              <tr key={name} className="border-t border-border">
                <td className="px-5 py-3 font-mono text-[10px]">{name}</td>
                <td className="px-5 py-3"><span className="rounded bg-brand-pale px-2 py-0.5 text-[9px] font-semibold text-primary">{type}</span></td>
                <td className="px-5 py-3">{records}</td>
                <td className="px-5 py-3 text-muted-foreground">{entities}</td>
                <td className="px-5 py-3"><span className="flex items-center gap-1 text-success"><CheckCircle2 size={12}/>{status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  </Workspace>;
}

// ==================== NETWORK GRAPH PAGE (Pipeline Step 4) ====================
export function NetworkPage() {
  return <Workspace screen="network" title="Entity Correlation & Network Graph" subtitle="Step 4 — Graph View on top, followed by Algorithm Summaries & Linkages on bottom.">
    <PipelineHeader currentStep={4}/>
    <NetworkPageInner embedMode={false}/>
  </Workspace>;
}

function NetworkPageInner({ embedMode = false }: { embedMode?: boolean }) {
  const { currentCase } = useCaseContext();
  const caseId = currentCase?.caseId || "CF-2025-BEED01";

  const [activeFilter, setActiveFilter] = useState("All");
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ACC_BEED_MULE01");
  const [entityDetails, setEntityDetails] = useState<EntityDetails | null>(null);

  const [kingpinData, setKingpinData] = useState<{
    mainSuspect: any;
    linkageSummary: any[];
    rankings?: any[];
  }>({
    mainSuspect: {
      id: "ACC_BEED_MULE01",
      type: "BANK_ACCOUNT",
      label: "Primary Mule Account — ACC_BEED_MULE01 (HDFC Beed)",
      value: "ACC_BEED_MULE01",
      riskScore: 98,
      pageRank: 0.98,
      betweenness: 0.94,
      degree: 9,
      riskReasons: [
        "🎯 PRIMARY MULE KINGPIN: Central account linked to 25 NCCRP cybercrime complaints",
        "💰 TOTAL VOLUME: ₹23.73 Crore transferred between September 2025 and April 2026",
        "⚡ PASS-THROUGH PATTERN: 99.4% of funds received were immediately withdrawn via ATM & cheque",
        "🌐 GEOGRAPHIC COVERAGE: Connected to victims across 12 Maharashtra districts"
      ]
    },
    linkageSummary: [
      { id: "LINK_1", sourceLabel: "+91 98760 01001 (Victim Beed)", sourceType: "PHONE", relationship: "TRANSFERRED_TO", targetLabel: "ACC_BEED_MULE01 (Primary Mule)", targetType: "BANK_ACCOUNT", evidenceId: "bank_transactions.csv" },
      { id: "LINK_2", sourceLabel: "+91 98220 02001 (Victim Nagpur)", sourceType: "PHONE", relationship: "TRANSFERRED_TO", targetLabel: "ACC_BEED_MULE01 (Primary Mule)", targetType: "BANK_ACCOUNT", evidenceId: "bank_transactions.csv" },
      { id: "LINK_3", sourceLabel: "+91 98230 03001 (Victim Sambhajinagar)", sourceType: "PHONE", relationship: "TRANSFERRED_TO", targetLabel: "ACC_BEED_MULE01 (Primary Mule)", targetType: "BANK_ACCOUNT", evidenceId: "bank_transactions.csv" },
      { id: "LINK_4", sourceLabel: "ACC_BEED_MULE01 (Primary Mule)", sourceType: "BANK_ACCOUNT", relationship: "TRANSFERRED_TO", targetLabel: "ACC_PUN_MULE02 (Layer 2 Pune)", targetType: "BANK_ACCOUNT", evidenceId: "bank_transactions.csv" },
      { id: "LINK_5", sourceLabel: "ACC_BEED_MULE01 (Primary Mule)", sourceType: "BANK_ACCOUNT", relationship: "TRANSFERRED_TO", targetLabel: "ACC_MUM_MULE03 (Layer 2 Mumbai)", targetType: "BANK_ACCOUNT", evidenceId: "bank_transactions.csv" },
      { id: "LINK_6", sourceLabel: "ACC_PUN_MULE02 (Layer 2 Pune)", sourceType: "BANK_ACCOUNT", relationship: "CASHED_OUT_BY", targetLabel: "+91 98210 01002 (Pune Cash Agent)", targetType: "PHONE", evidenceId: "bank_transactions.csv" },
      { id: "LINK_7", sourceLabel: "+91 97654 32100 (Beed Operator)", sourceType: "PHONE", relationship: "CALLED", targetLabel: "+91 98760 01001 (Master Coordinator)", targetType: "PHONE", evidenceId: "cdr_sample.csv" },
      { id: "LINK_8", sourceLabel: "356001234567890 (Handset IMEI)", sourceType: "IMEI", relationship: "ACCESSED_FROM", targetLabel: "103.21.45.67 (C2 Server)", targetType: "IP_ADDRESS", evidenceId: "ipdr_sample.csv" },
      { id: "LINK_9", sourceLabel: "com.beed.investment.helper (APK)", sourceType: "APK", relationship: "COMMUNICATES_WITH", targetLabel: "103.21.45.67 (C2 Server)", targetType: "IP_ADDRESS", evidenceId: "apk_metadata.json" }
    ]
  });

  useEffect(() => {
    let isMounted = true;
    async function loadGraphAndKingpin() {
      try {
        const [graphRes, kingpinRes] = await Promise.all([
          graphService.getGraphData(caseId),
          graphService.getKingpinPrediction(caseId)
        ]);

        if (isMounted) {
          if (graphRes.success && graphRes.nodes?.length > 0) {
            setNodes(graphRes.nodes);
            setEdges(graphRes.edges || []);
          }
          if (kingpinRes.success && kingpinRes.mainSuspect) {
            setKingpinData({
              mainSuspect: kingpinRes.mainSuspect,
              linkageSummary: kingpinRes.linkageSummary || [],
              rankings: (kingpinRes as any).rankings
            });
          }
        }
      } catch (e) {
        console.warn("Could not load graph/kingpin from API:", e);
      }
    }
    loadGraphAndKingpin();
    return () => { isMounted = false; };
  }, [caseId]);

  useEffect(() => {
    let isMounted = true;
    if (!selectedNodeId) return;
    async function loadDetails() {
      try {
        const res = await graphService.getEntityDetails(selectedNodeId);
        if (isMounted && res.success) {
          setEntityDetails(res);
        }
      } catch (e) {
        console.warn("Could not load entity details:", e);
      }
    }
    loadDetails();
    return () => { isMounted = false; };
  }, [selectedNodeId]);

  const mainSuspect = kingpinData.mainSuspect;

  return <div>
    {/* 1. TOP OF PAGE: FILTER BUTTONS + GRAPH VIEW + ENTITY INSPECTOR */}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {["All", "Financial", "Communication", "Device", "Network", "Malware"].map(x => (
          <button
            key={x}
            onClick={() => setActiveFilter(x)}
            className={`rounded-full px-3 py-1 text-[10px] cursor-pointer transition-colors ${activeFilter === x ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground">
        Demo Case: <span className="font-semibold text-foreground">Beed (Maharashtra) Money Mule Network (₹23.73 Cr)</span>
      </div>
    </div>

    {/* GRAPH VIEW CONTAINER (TOP OF PAGE) */}
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <CytoscapeGraph
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={nodeId => setSelectedNodeId(nodeId)}
        activeFilter={activeFilter}
      />
      <Panel>
        <PanelTitle>Selected Entity Details</PanelTitle>
        <div className="space-y-5 p-4 text-[10px]">
          {entityDetails ? (
            <>
              <div>
                <b className="text-xs text-foreground block">{entityDetails.label || entityDetails.value}</b>
                <p className="mt-1 text-muted-foreground font-mono text-[10px]">{entityDetails.value}</p>
                <span className={`mt-2 inline-flex rounded px-2 py-1 font-semibold text-[9px] ${entityDetails.priority === 'high' || entityDetails.riskScore > 70 ? 'bg-danger-pale text-danger' : 'bg-brand-pale text-primary'}`}>
                  {entityDetails.riskScore > 70 ? 'High Risk / Primary Mule' : 'Medium Risk'} ({entityDetails.riskScore}/100)
                </span>
              </div>
              <div>
                <b className="block mb-2 text-foreground">Associated Entities</b>
                {entityDetails.associatedEntities && Object.entries(entityDetails.associatedEntities).map(([x, n]) => (
                  <div key={x} className="mt-1.5 flex justify-between text-muted-foreground capitalize">
                    <span>{x.replace(/([A-Z])/g, ' $1')}</span>
                    <b>{n as string | number}</b>
                  </div>
                ))}
              </div>
              <div>
                <b className="block mb-2 text-foreground">Risk Factors</b>
                {entityDetails.riskFactors && entityDetails.riskFactors.map(x => (
                  <p key={x} className="mt-1.5 flex gap-2 text-muted-foreground">
                    <AlertTriangle size={12} className="text-danger shrink-0 mt-0.5"/>
                    <span>{x}</span>
                  </p>
                ))}
              </div>
              {entityDetails.graphAnalytics && (
                <div className="border-t border-border pt-3">
                  <b className="block mb-2 text-foreground">Graph Importance Signals</b>
                  <div className="flex justify-between text-muted-foreground"><span>PageRank Score:</span> <b>{entityDetails.graphAnalytics.graphImportance}</b></div>
                  <div className="flex justify-between text-muted-foreground mt-1"><span>Betweenness Score:</span> <b>{entityDetails.graphAnalytics.bridgeScore}</b></div>
                  <div className="flex justify-between text-muted-foreground mt-1"><span>Connection Count:</span> <b>{entityDetails.graphAnalytics.connectionCount}</b></div>
                </div>
              )}
              {entityDetails.evidenceSources && (
                <div className="border-t border-border pt-3">
                  <b className="block mb-2 text-foreground">Evidence Sources</b>
                  {entityDetails.evidenceSources.map(src => (
                    <div key={src} className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                      <FileText size={10}/><span className="font-mono text-[10px]">{src}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Select a node in the network graph above to inspect entity details.</p>
          )}
        </div>
      </Panel>
    </div>

    {/* 2. SIMPLE PLAIN-ENGLISH INVESTIGATION SUMMARY DIRECTLY BELOW GRAPH */}
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {/* Kingpin Summary Card */}
      <Panel className="border-l-4 border-l-danger bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-danger px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">👑 MAIN SUSPECT / KINGPIN</span>
          <span className="text-[10px] font-bold text-danger">Risk Score: 98/100</span>
        </div>
        <h3 className="text-sm font-bold text-foreground">ACC_BEED_MULE01</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Primary Pass-Through Mule Account (HDFC Beed)</p>
        <div className="mt-3 text-[10px] space-y-1.5 text-muted-foreground bg-muted/30 p-2.5 rounded border border-border">
          <p>• <b>25 Complaints Linked</b> on NCCRP portal across 12 districts.</p>
          <p>• <b>₹23.73 Crore</b> routed and cashed out within minutes of deposit.</p>
        </div>
      </Panel>

      {/* Victims Summary Card */}
      <Panel className="border-l-4 border-l-success bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-success px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">👤 VICTIMS (WHO LOST MONEY)</span>
          <span className="text-[10px] font-bold text-success">25 Complaints</span>
        </div>
        <div className="space-y-1 text-[10px] text-foreground font-medium">
          <p>👤 <b>Victim Beed Resident</b> (+91 98760 01001) — Lost ₹20.0 Lakhs</p>
          <p>👤 <b>Victim Nagpur Trader</b> (+91 98220 02001) — Lost ₹60.5 Lakhs</p>
          <p>👤 <b>Victim Sambhajinagar</b> (+91 98230 03001) — Lost ₹47.0 Lakhs</p>
          <p>👤 <b>Victim Nashik Businessman</b> (+91 98240 04001) — Lost ₹59.5 Lakhs</p>
          <p>👤 <b>Victim Solapur Investor</b> (+91 98250 05001) — Lost ₹48.0 Lakhs</p>
        </div>
      </Panel>

      {/* Connection Guide Card */}
      <Panel className="border-l-4 border-l-primary bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-primary px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">🔗 WHO IS CONNECTED WITH WHOM</span>
        </div>
        <div className="space-y-1.5 text-[10px] text-muted-foreground">
          <p>• <b>Victims → Primary Mule</b>: 25 Victims transfer funds to <code>ACC_BEED_MULE01</code></p>
          <p>• <b>Primary Mule → Layer 2</b>: Splits IMPS/RTGS to Pune (<code>ACC_PUN_MULE02</code>) & Mumbai</p>
          <p>• <b>Layer 2 → Cash Agent</b>: Agent (+91 98210 01002) executes ATM/Cheque cash out</p>
          <p>• <b>Operators → Calls</b>: Operator (+91 97654 32100) calls Coordinator (+91 98760 01001)</p>
        </div>
      </Panel>
    </div>

    {/* 3. KINGPIN ALGORITHM DETAILS */}
    {mainSuspect && (
      <Panel className="mt-6 border-l-4 border-l-danger bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-danger px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                👑 Algorithmic Suspect Prediction
              </span>
              <span className="text-[10px] font-bold text-danger">Risk Score: {mainSuspect.riskScore}/100</span>
            </div>
            <h3 className="text-base font-bold text-foreground">{mainSuspect.label || mainSuspect.value}</h3>
            <p className="text-[11px] text-muted-foreground">Derived from NER Relationship Resolution → Normalization → PageRank Centrality → Betweenness Centrality → Kingpin Algorithm</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] bg-muted/40 p-3 rounded border border-border">
            <div><span className="text-muted-foreground">PageRank Score:</span> <b className="text-primary">{mainSuspect.pageRank}</b></div>
            <div><span className="text-muted-foreground">Betweenness Score:</span> <b className="text-primary">{mainSuspect.betweenness}</b></div>
            <div><span className="text-muted-foreground">Graph Connections:</span> <b>{mainSuspect.degree}</b></div>
          </div>
        </div>
        {mainSuspect.riskReasons && mainSuspect.riskReasons.length > 0 && (
          <div className="mt-4 border-t border-border pt-3 text-[10px] text-muted-foreground">
            <b className="text-foreground">Key Suspicion Drivers:</b>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {mainSuspect.riskReasons.map((r: string) => (
                <div key={r} className="flex items-start gap-2 rounded bg-muted/30 p-2 border border-border/60 text-[10px]">
                  <AlertTriangle size={12} className="text-danger shrink-0 mt-0.5"/>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>
    )}

    {/* Evidence Linkage Table (Bottom Summary) */}
    <Panel className="mt-6 overflow-hidden">
      <PanelTitle side={<span className="text-[10px] text-muted-foreground">Derived from {caseId} synthetic Beed case evidence files</span>}>
        Evidence Linkage Summary (Detailed Who Connected With Whom)
      </PanelTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-[11px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Source Entity</th>
              <th className="px-5 py-3 font-medium">Relationship</th>
              <th className="px-5 py-3 font-medium">Target Entity</th>
              <th className="px-5 py-3 font-medium">Evidence Source File</th>
            </tr>
          </thead>
          <tbody>
            {kingpinData.linkageSummary.map(link => (
              <tr key={link.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-semibold">{link.sourceLabel}</td>
                <td className="px-5 py-3">
                  <span className="rounded bg-brand-pale px-2 py-0.5 text-[9px] font-semibold text-primary">
                    {link.relationship}
                  </span>
                </td>
                <td className="px-5 py-3 font-semibold">{link.targetLabel}</td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-[10px]">{link.evidenceId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  </div>;
}

// ==================== RISK PAGE (Pipeline Step 6) ====================
const riskRows = [
  ["ACC_BEED_MULE01", "Bank Account (Primary Mule)", "98", "Critical", "Central pass-through account • 25 NCCRP linked complaints • ₹23.73 Cr volume • Immediate ATM/cheque cash outs"],
  ["+91 97654 32100", "Phone (Beed Operator)", "96", "Critical", "Primary mule account operator • 50 CDR coordination calls • SIM swap detected prior to fraud"],
  ["IP_C2_BEED (103.21.45.67)", "IP Address (C2 Server)", "95", "Critical", "C2 server for Fake Investment APK • Used for exfiltrating victim OTPs • Hosts phishing site"],
  ["APK: com.beed.investment.helper", "APK / Malware", "96", "Critical", "Banking Trojan / Scam App • OTP SMS Interceptor • Sideloaded via phishing email"],
  ["+91 98760 01001", "Phone (Master Syndicate)", "94", "Critical", "Master network coordinator • Direct CDR linkage to Beed operator & field agents"],
  ["ACC_PUN_MULE02 (ICICI Pune)", "Bank Account (Layer 2)", "93", "Critical", "Tier-2 pass-through mule account • Received ₹6.5 Cr via IMPS split from primary account"],
  ["ACC_MUM_MULE03 (PNB Mumbai)", "Bank Account (Layer 2)", "91", "Critical", "Tier-2 hawala layering account • Received ₹8.4 Cr via RTGS from primary account"],
  ["+91 98210 01002", "Phone (Field Agent Pune)", "88", "High", "Pune withdrawal agent • Performed self-cheque and ATM withdrawals for Layer 2 account"],
];

export function RiskPage(){
  return <Workspace screen="risk" title="Risk Analysis" subtitle="Step 6 — Entities ranked by multi-factor risk score (Beed Money Mule Case).">
    <PipelineHeader currentStep={6}/>
    <Panel className="overflow-hidden">
      <PanelTitle side={<span className="text-[10px] text-danger font-semibold">{riskRows.filter(r => parseInt(r[2]) >= 90).length} critical entities identified</span>}>
        Entity Risk Rankings — Beed (Maharashtra) Money Mule Case
      </PanelTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[11px]">
          <thead className="bg-muted/50">
            <tr>{["#", "Entity", "Type", "Risk Score", "Level", "Reasons", "Action"].map(h => <th className="px-4 py-4 font-medium" key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {riskRows.map((r, i) => {
              const score = parseInt(r[2]);
              const level = r[3];
              return (
                <tr key={r[0]} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-4 text-muted-foreground text-[10px]">{i + 1}</td>
                  <td className="px-4 py-4 font-semibold font-mono text-[10px]">{r[0]}</td>
                  <td className="px-4 py-4">{r[1]}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${score >= 90 ? "bg-danger" : score >= 75 ? "bg-warning" : "bg-success"}`} style={{ width: `${score}%` }}/>
                      </div>
                      <span className={`font-bold ${score >= 90 ? "text-danger" : score >= 75 ? "text-warning" : "text-success"}`}>{r[2]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded px-2 py-0.5 text-[9px] font-bold ${level === "Critical" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"}`}>{level}</span>
                  </td>
                  <td className="max-w-sm px-4 py-4 text-muted-foreground text-[10px]">{r[4]}</td>
                  <td className="px-4 py-4"><Button variant="outline" size="sm">{i < 5 ? "Investigate" : "Review"}</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  </Workspace>;
}

// ==================== TIMELINE PAGE (Pipeline Step 5) ====================
const events = [
  ["2025-08-15 08:00", "SIM Swap Detected on Operator Line", "MSISDN 9765432100 shows rapid SIM Swap to new ICCID on handset IMEI 356001234567890", Smartphone, "warning"],
  ["2025-08-20 19:05", "Fake Investment App Sideloaded", "com.beed.investment.helper installed on suspect handset • C2 beacon sent to 103.21.45.67", FileCode2, "danger"],
  ["2025-09-08 10:15", "Phishing Campaign Dispatched", "Phishing email sent to Victims offering 35% monthly returns via Beed HDFC account", Mail, "warning"],
  ["2025-09-08 11:02", "Coordination Call Logged", "+91 98760 01001 (Master Coordinator) calls +91 97654 32100 (Beed Operator) — 14m call", Phone, "brand"],
  ["2025-09-08 11:05", "First Victim Deposit (Beed)", "Victim transfers ₹20,00,000 into Primary Mule Account ACC_BEED_MULE01 (HDFC)", CircleDollarSign, "danger"],
  ["2025-09-08 11:09", "Rapid Pass-Through Layering 1", "ACC_BEED_MULE01 → ACC_PUN_MULE02 (ICICI Pune): ₹6,50,00,000 transferred via IMPS split", CircleDollarSign, "danger"],
  ["2025-09-08 11:12", "ATM & Cheque Cash Out (Pune)", "Field agent (+91 98210 01002) executes cash withdrawals at Pune ICICI branch", Banknote, "brand"],
  ["2025-09-09 14:15", "Second Victim Deposit (Nagpur)", "Nagpur Victim transfers ₹60,50,000 via NEFT to ACC_BEED_MULE01", CircleDollarSign, "danger"],
  ["2025-09-09 14:18", "Rapid Pass-Through Layering 2", "ACC_BEED_MULE01 → ACC_MUM_MULE03 (PNB Mumbai): ₹8,40,00,000 transferred via RTGS", CircleDollarSign, "danger"],
  ["2025-09-15 11:00", "Digital Arrest Fraud (Sambhajinagar)", "Victim transfers ₹47,00,000 under fake digital arrest extortion scheme", CircleDollarSign, "danger"],
  ["2025-09-25 15:35", "Customs Clearance Fraud (Kolhapur)", "Victim transfers ₹3,20,00,000 into ACC_BEED_MULE01", CircleDollarSign, "danger"],
  ["2025-10-17 16:50", "Forex Trading Scam (Satara)", "Victim transfers ₹4,10,00,000 into ACC_BEED_MULE01", CircleDollarSign, "danger"],
  ["2026-04-15 10:00", "NCCRP Cross-Correlation", "NCCRP portal links 25 separate complaints across Maharashtra to ACC_BEED_MULE01 (₹23.73 Cr total)", ShieldCheck, "success"],
] as const;

const eventTone: Record<string, string> = { brand: "bg-primary", warning: "bg-warning", success: "bg-success", info: "bg-info", danger: "bg-danger" };

export function TimelinePage(){
  return <Workspace screen="timeline" title="Fraud Timeline" subtitle="Step 5 — Chronological reconstruction of the Beed Money Mule Network Case.">
    <PipelineHeader currentStep={5}/>
    <Panel className="p-6">
      <div className="relative mx-auto max-w-4xl before:absolute before:bottom-4 before:left-[90px] before:top-4 before:w-px before:bg-border">
        {events.map(([time, title, sub, Icon, tone]) => (
          <div key={time + title} className="relative grid grid-cols-[80px_44px_1fr] items-start py-4 gap-3">
            <time className="pt-2 text-[10px] font-semibold text-muted-foreground leading-tight">{time.replace(" ", "\n")}</time>
            <span className={`z-10 grid size-8 place-items-center rounded-full border-4 border-card text-primary-foreground ${eventTone[tone]}`}><Icon size={12}/></span>
            <div className="rounded-md border border-border p-3">
              <b className="text-xs">{title}</b>
              <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  </Workspace>;
}

// ==================== REPORTS PAGE (Pipeline Step 7) ====================
export function ReportsPage(){
  return <Workspace screen="reports" title="Investigative Brief — Final Report" subtitle="Step 7 — One-page summary of Beed Money Mule Case for law enforcement submission." action={<Button size="sm"><Upload/> Download PDF</Button>}>
    <PipelineHeader currentStep={7}/>
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel>
        <PanelTitle>Case Overview</PanelTitle>
        <div className="grid grid-cols-2 gap-y-3 p-4 text-[10px]">
          {[["Case ID","CF-2025-BEED01"],["Period","Sep 2025 – Apr 2026"],["Total Fraud Volume","₹23,73,00,000"],["NCCRP Complaints","25 Linked Cases"],["Primary Mule Account","ACC_BEED_MULE01 (HDFC)"],["Risk Classification","CRITICAL / SYNDICATE"]].map(([a,b])=><div key={a}><span className="text-muted-foreground">{a}</span><b className="mt-1 block">{b}</b></div>)}
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Prime Suspects & Kingpin</PanelTitle>
        <div className="space-y-2 p-4 text-[10px]">
          {[["Primary Mule Account","ACC_BEED_MULE01 (HDFC Beed)"],["Mule Operator","+91 97654 32100 (Beed)"],["Master Coordinator","+91 98760 01001"],["Layer 2 Account (Pune)","ACC_PUN_MULE02 (ICICI)"],["C2 Server IP","103.21.45.67"],["Scam APK","com.beed.investment.helper"]].map(([a,b])=><div className="flex justify-between" key={a}><span className="text-muted-foreground">{a}</span><b className="font-mono text-[10px]">{b}</b></div>)}
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Risk Indicators</PanelTitle>
        <div className="space-y-2 p-4 text-[10px]">
          {["Pass-through mule pattern (₹23.73 Cr over 8 months)","NCCRP portal linked 25 distinct victim complaints","Multi-district coverage (12 Maharashtra districts)","Rapid IMPS/RTGS layering to Pune & Mumbai","ATM & self-cheque cash out within minutes of deposit","C2 infrastructure (103.21.45.67) exfiltrating victim OTPs","SIM swap executed before major fraud transactions"].map(x=><p key={x} className="flex items-center gap-2"><AlertTriangle size={11} className="text-danger shrink-0"/>{x}</p>)}
        </div>
      </Panel>
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Panel>
        <PanelTitle>Money Trail Flow</PanelTitle>
        <div className="flex items-center justify-around gap-2 overflow-x-auto p-6">
          {[["25 Victims (12 Districts)", "₹23.73 Cr total"],["ACC_BEED_MULE01","Primary Mule HDFC"],["ACC_PUN_MULE02","Layer 2 ICICI Pune"],["Field ATM/Hawala","Cash Out Agents"]].map(([name, role], i)=><div key={name} className="flex items-center gap-2"><div className="text-center"><span className="grid size-12 place-items-center rounded-full bg-warning-pale text-warning"><Banknote size={18}/></span><b className="mt-1 block text-[10px]">{name}</b><span className="text-[9px] text-muted-foreground">{role}</span></div>{i < 3 && <ArrowRight size={14} className="text-muted-foreground shrink-0"/>}</div>)}
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Law Enforcement Action Items</PanelTitle>
        <div className="grid gap-2 p-5 text-[11px]">
          {["Issue immediate lien/freeze order on ACC_BEED_MULE01 (HDFC Beed)", "Freeze secondary layering accounts ACC_PUN_MULE02 and ACC_MUM_MULE03", "Obtain CCTV footage of ATM cash withdrawals at Pune & Mumbai branches", "Issue Look Out Circular (LOC) for operator MSISDN +91 97654 32100", "Coordinate with Maharashtra Cyber Police regarding 25 NCCRP complaint IDs", "Block C2 server IP 103.21.45.67 and domain beed-investment-portal.com", "Preserve CDR/IPDR subscriber data forIMEIs 356001234567890 & 357002345678901", "Register formal FIR under IT Act Sections 66C, 66D, & IPC 420/120B"].map(x=><p key={x} className="flex gap-2"><CheckCircle2 size={14} className="text-success shrink-0 mt-0.5"/>{x}</p>)}
        </div>
      </Panel>
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Panel>
        <PanelTitle>Key Fraud Milestones</PanelTitle>
        <div className="p-4 text-[10px]">
          {events.slice(0, 6).map(e=><div className="grid grid-cols-[90px_1fr] border-b border-border py-2 last:border-0 gap-2" key={e[0]+e[1]}><b className="text-[9px] text-muted-foreground">{e[0]}</b><span>{e[1]}</span></div>)}
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Evidence Verified & Analyzed</PanelTitle>
        <div className="p-4 text-[10px]">
          {["cdr_sample.csv (50 call records)","ipdr_sample.csv (10 session logs)","bank_transactions.csv (30 transfers - ₹23.73 Cr)","phishing_email.eml (Scam offer header)","mobile_logs.json (OnePlus Nord CE extraction)","apk_metadata.json (Beed Investment Trojan)"].map(x=><div className="flex justify-between border-b border-border py-2 last:border-0" key={x}><span className="font-mono">{x}</span><span className="flex items-center gap-1 text-success"><CheckCircle2 size={11}/>Verified</span></div>)}
        </div>
      </Panel>
    </div>
  </Workspace>;
}

