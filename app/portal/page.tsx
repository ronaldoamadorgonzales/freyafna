"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Users, 
  Flame, 
  TrendingUp, 
  Check, 
  Search, 
  Filter, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  Activity, 
  FileText,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingDown,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Lock,
  Copy,
  Link2,
  CheckCircle2,
  Upload,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  Image as ImageIcon
} from "lucide-react";

interface LeadResponse {
  id: string;
  leadId: string;
  moduleType: string;
  inputs: any;
  outputs: any;
}

interface Lead {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string | null;
  overallLeadScore: number;
  leadCategory: "HOT" | "WARM" | "COLD";
  insightsViewCount?: number;
  lastViewedInsightsAt?: string | null;
  insightsEmailSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  profile: {
    age: number;
    maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
    dependentsCount: number;
    monthlyIncomeRange: string;
    currentSavings: string;
    retirementAgeGoal: number;
  } | null;
  assignment: {
    id: string;
    leadId: string;
    advisorId: string | null;
    status: "PENDING" | "CONTACTED" | "CONVERTED" | "LOST";
    notes: string | null;
    advisorName: string;
    assignedAt: string;
  } | null;
  responses: LeadResponse[];
}

interface Advisor {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  advisorCode?: string | null;
  title?: string;
  avatarUrl?: string | null;
  isDefault?: boolean;
  calendlyUrl?: string | null;
  linkedinUrl?: string | null;
  status: "ACTIVE" | "INACTIVE";
  role: "ADMIN" | "ADVISOR";
  createdAt?: string;
}

export default function AdvisorPortal() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; fullName: string; role: "ADMIN" | "ADVISOR"; advisorCode?: string | null; isDefault?: boolean } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>("admin"); // "admin" or advisor ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation tabs for Admin
  const [activeTab, setActiveTab] = useState<"pipeline" | "advisors">("pipeline");

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Selected Lead (Details Drawer) State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [statusInput, setStatusInput] = useState<"PENDING" | "CONTACTED" | "CONVERTED" | "LOST">("PENDING");
  const [isUpdating, setIsUpdating] = useState(false);

  // Advisor CRUD Modal State
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null); // null means creating
  const [advisorForm, setAdvisorForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    advisorCode: "",
    title: "",
    avatarUrl: "",
    isDefault: false,
    calendlyUrl: "",
    linkedinUrl: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    role: "ADVISOR" as "ADMIN" | "ADVISOR",
    password: "",
  });
  const [advisorSaving, setAdvisorSaving] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  // Image Cropper Modal State
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<HTMLImageElement>(null);

  // Toast State
  const [toast, setToast] = useState<{ title: string; message: string; visible: boolean }>({
    title: "",
    message: "",
    visible: false
  });

  const triggerToast = (title: string, message: string) => {
    setToast({ title, message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Auth Session Hook
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.role === "ADVISOR") {
            setSelectedAdvisorId(data.user.id);
          } else {
            setSelectedAdvisorId("admin");
          }
        } else {
          window.location.href = "/portal/login";
        }
      } catch (err) {
        console.error("Auth verify error:", err);
        window.location.href = "/portal/login";
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  // Fetch Leads and Advisors
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/advisor/leads", {
        headers: {
          "x-advisor-id": selectedAdvisorId,
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch leads");
      }
      const data = await res.json();
      setLeads(data.leads || []);
      setAdvisors(data.advisors || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [selectedAdvisorId, currentUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/portal/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Handle lead click to open detail drawer
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setNotesInput(lead.assignment?.notes || "");
    setStatusInput(lead.assignment?.status || "PENDING");
  };

  // Save lead update
  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/advisor/assignments/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: statusInput,
          notes: notesInput,
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save changes.");
      }

      triggerToast("Update Saved", "Lead assignment notes and status synced successfully.");
      
      // Update local state
      setLeads(prev => prev.map(item => {
        if (item.id === selectedLead.id) {
          return {
            ...item,
            assignment: item.assignment ? {
              ...item.assignment,
              status: statusInput,
              notes: notesInput,
            } : null
          };
        }
        return item;
      }));

      setSelectedLead(prev => prev ? {
        ...prev,
        assignment: prev.assignment ? {
          ...prev.assignment,
          status: statusInput,
          notes: notesInput,
        } : null
      } : null);

    } catch (err: any) {
      console.error(err);
      triggerToast("Error", err.message || "Could not update lead notes.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Image Cropper Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      triggerToast("Invalid File Type", "Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setRawImageSrc(src);
      setCropZoom(1);
      setCropPan({ x: 0, y: 0 });
      setShowCropperModal(true);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const handlePanStart = (clientX: number, clientY: number) => {
    setIsPanning(true);
    setPanStart({ x: clientX - cropPan.x, y: clientY - cropPan.y });
  };

  const handlePanMove = (clientX: number, clientY: number) => {
    if (!isPanning) return;
    setCropPan({
      x: clientX - panStart.x,
      y: clientY - panStart.y,
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const applyCrop = () => {
    if (!rawImageSrc) return;

    const canvas = document.createElement("canvas");
    const outputSize = 400; // Standard 400x400 square avatar
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      triggerToast("Error", "Could not process image crop.");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, outputSize, outputSize);

      const viewportSize = 260;
      const baseScale = Math.max(viewportSize / img.naturalWidth, viewportSize / img.naturalHeight);
      const currentScale = baseScale * cropZoom;
      
      const renderW = img.naturalWidth * currentScale;
      const renderH = img.naturalHeight * currentScale;

      const viewX = (viewportSize - renderW) / 2 + cropPan.x;
      const viewY = (viewportSize - renderH) / 2 + cropPan.y;

      const outputScaleRatio = outputSize / viewportSize;

      const outW = renderW * outputScaleRatio;
      const outH = renderH * outputScaleRatio;
      const outX = viewX * outputScaleRatio;
      const outY = viewY * outputScaleRatio;

      ctx.drawImage(img, outX, outY, outW, outH);

      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
      setAdvisorForm(prev => ({ ...prev, avatarUrl: croppedDataUrl }));
      setShowCropperModal(false);
      setRawImageSrc(null);
      triggerToast("Profile Picture Cropped", "Image cropped and applied to advisor profile.");
    };
    img.src = rawImageSrc;
  };

  // Open advisor form modal (create or edit mode)
  const openAdvisorModal = (advisor: Advisor | null = null) => {
    setEditingAdvisor(advisor);
    setAdvisorError(null);
    if (advisor) {
      setAdvisorForm({
        fullName: advisor.fullName,
        email: advisor.email,
        phone: advisor.phone || "",
        advisorCode: advisor.advisorCode || "",
        title: advisor.title || "Senior Wealth Planner",
        avatarUrl: advisor.avatarUrl || "",
        isDefault: !!advisor.isDefault,
        calendlyUrl: advisor.calendlyUrl || "",
        linkedinUrl: advisor.linkedinUrl || "",
        status: advisor.status,
        role: advisor.role,
        password: "", // password optional on edit
      });
    } else {
      setAdvisorForm({
        fullName: "",
        email: "",
        phone: "",
        advisorCode: "",
        title: "Senior Wealth Planner",
        avatarUrl: "",
        isDefault: false,
        calendlyUrl: "",
        linkedinUrl: "",
        status: "ACTIVE",
        role: "ADVISOR",
        password: "", // password required on create
      });
    }
    setShowAdvisorModal(true);
  };

  // Copy referral link helper
  const copyReferralLink = (code: string | null | undefined) => {
    if (!code) {
      triggerToast("No Advisor Code", "This advisor does not have a unique referral code assigned yet.");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/?ref=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    triggerToast("Link Copied!", `Referral link for ${code} copied to clipboard: ${url}`);
  };

  // Save Advisor (CRUD POST/PUT)
  const handleSaveAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdvisorSaving(true);
    setAdvisorError(null);

    const isEdit = !!editingAdvisor;
    const url = isEdit ? `/api/advisor/manage/${editingAdvisor.id}` : "/api/advisor/manage";
    const method = isEdit ? "PUT" : "POST";

    // Validation
    if (!advisorForm.fullName || !advisorForm.email || (!isEdit && !advisorForm.password)) {
      setAdvisorError("Full Name, Email, and Password (for new users) are required.");
      setAdvisorSaving(false);
      return;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(advisorForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save advisor settings.");
      }

      triggerToast(
        isEdit ? "Advisor Updated" : "Advisor Created",
        `${advisorForm.fullName} has been successfully saved.`
      );
      
      setShowAdvisorModal(false);
      fetchData(); // Reload records
    } catch (err: any) {
      setAdvisorError(err.message || "An error occurred.");
    } finally {
      setAdvisorSaving(false);
    }
  };

  // Delete Advisor (CRUD DELETE)
  const handleDeleteAdvisor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete advisor ${name}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/advisor/manage/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete advisor.");
      }

      triggerToast("Advisor Deleted", `${name} has been removed from system.`);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error deleting advisor.");
    }
  };

  // Calculations for Lead Details drawer
  const getPillarCalculations = (lead: Lead) => {
    if (!lead.profile) return null;

    const age = lead.profile.age;
    const initialSavings = Number(lead.profile.currentSavings);
    const retirementAge = lead.profile.retirementAgeGoal;

    const msResponse = lead.responses.find(r => r.moduleType === "MILESTONE_SAVINGS");
    const retResponse = lead.responses.find(r => r.moduleType === "RETIREMENT");
    const incResponse = lead.responses.find(r => r.moduleType === "INCOME_PROTECTION");
    const eduResponse = lead.responses.find(r => r.moduleType === "EDUCATION");
    const heaResponse = lead.responses.find(r => r.moduleType === "HEALTH_PROTECTION");

    const initialSavingsVal = msResponse?.inputs?.initialSavings ?? initialSavings;
    const monthlyContributionVal = msResponse?.inputs?.monthlyContribution ?? 5000;
    const yearsVal = msResponse?.inputs?.years ?? 10;
    const returnVal = msResponse?.inputs?.expectedReturn ?? 7.0;
    const projectedTotalVal = msResponse?.outputs?.projectedTotal ?? 0;

    const retExpenses = retResponse?.inputs?.retExpenses ?? 50000;
    const retPension = retResponse?.inputs?.retPension ?? 0;
    const yearsToRetire = Math.max(0, retirementAge - age);
    const futureAnnualExpenses = (retExpenses * 12) * Math.pow(1.04, yearsToRetire);
    const retirementTarget = futureAnnualExpenses / 0.06;
    const pensionLumpSum = (retPension * 12) / 0.06;
    const retirementGap = Math.max(0, retirementTarget - pensionLumpSum - projectedTotalVal);

    const protExpenses = incResponse?.inputs?.protExpenses ?? retExpenses;
    const protInterest = incResponse?.inputs?.protInterest ?? 6;
    const protLiabilities = incResponse?.inputs?.protLiabilities ?? 200000;
    const protEmergency = incResponse?.inputs?.protEmergency ?? 100000;
    const protFinal = incResponse?.inputs?.protFinal ?? 50000;
    const protExisting = incResponse?.inputs?.protExisting ?? 1000000;
    const amountNeededToProvide = (protExpenses * 12) / (protInterest / 100);
    const totalLiabilities = protLiabilities + protEmergency + protFinal;
    const totalCashAssets = protExisting + initialSavingsVal;
    const incomeTarget = amountNeededToProvide + totalLiabilities;
    const incomeGap = Math.max(0, incomeTarget - totalCashAssets);

    const childName = eduResponse?.inputs?.childName ?? "Junior";
    const childAge = eduResponse?.inputs?.childAge ?? 5;
    const annualTuition = eduResponse?.inputs?.annualTuition ?? 100000;
    const yearsToCollege = Math.max(0, 18 - childAge);
    const t1 = annualTuition * Math.pow(1.08, yearsToCollege);
    const t2 = annualTuition * Math.pow(1.08, yearsToCollege + 1);
    const t3 = annualTuition * Math.pow(1.08, yearsToCollege + 2);
    const t4 = annualTuition * Math.pow(1.08, yearsToCollege + 3);
    const educationTarget4 = t1 + t2 + t3 + t4;
    const educationGap4 = Math.max(0, educationTarget4 - 120000);

    const desiredHealth = heaResponse?.inputs?.desiredHealth ?? 2000000;
    const existingHealth = heaResponse?.inputs?.existingHealth ?? 500000;
    const healthGap = Math.max(0, desiredHealth - existingHealth);

    return {
      milestone: {
        initialSavings: initialSavingsVal,
        monthlyContribution: monthlyContributionVal,
        years: yearsVal,
        expectedReturn: returnVal,
        projectedTotal: projectedTotalVal
      },
      retirement: {
        expenses: retExpenses,
        pension: retPension,
        yearsToRetire,
        target: retirementTarget,
        gap: retirementGap
      },
      income: {
        expenses: protExpenses,
        liabilities: protLiabilities,
        existing: protExisting,
        target: incomeTarget,
        gap: incomeGap
      },
      education: {
        childName,
        childAge,
        yearsToCollege,
        target: educationTarget4,
        gap: educationGap4
      },
      health: {
        desired: desiredHealth,
        existing: existingHealth,
        gap: healthGap
      }
    };
  };

  // Filter Leads client-side
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || 
      lead.assignment?.status === statusFilter;

    const matchesCategory = 
      categoryFilter === "all" || 
      lead.leadCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // KPI Calculations
  const totalLeadsCount = filteredLeads.length;
  const hotLeadsCount = filteredLeads.filter(l => l.leadCategory === "HOT").length;
  const warmLeadsCount = filteredLeads.filter(l => l.leadCategory === "WARM").length;
  const convertedLeadsCount = filteredLeads.filter(l => l.assignment?.status === "CONVERTED").length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((convertedLeadsCount / totalLeadsCount) * 100) : 0;
  const pendingFollowups = filteredLeads.filter(l => l.assignment?.status === "PENDING").length;

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#f8fafc] text-slate-800">
        <svg className="animate-spin h-10 w-10 text-teal-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-extrabold text-xs uppercase tracking-widest text-slate-400">Securing Session...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      
      {/* Navbar - Light Theme style from design reference */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-inner">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-teal-950 leading-none">
                Freya<span className="text-teal-600">FNA</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Advisor Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* My Referral Link Quick Copy */}
            {currentUser?.advisorCode && (
              <button
                type="button"
                onClick={() => copyReferralLink(currentUser.advisorCode)}
                title="Copy your personal client landing page link"
                className="hidden md:inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100/80 text-teal-700 border border-teal-200/80 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <Link2 className="w-3.5 h-3.5 text-teal-700" />
                <span>My Link: <span className="font-mono text-[11px] font-black">{currentUser.advisorCode}</span></span>
              </button>
            )}

            {/* Identity Simulation Switcher (ADMIN ONLY) */}
            {currentUser?.role === "ADMIN" && (
              <div className="hidden sm:flex items-center space-x-3 bg-slate-50 border border-slate-200/80 p-1.5 rounded-2xl">
                <span className="text-xs text-slate-500 font-bold px-3 uppercase tracking-wider">Viewing As:</span>
                <select
                  value={selectedAdvisorId}
                  onChange={(e) => setSelectedAdvisorId(e.target.value)}
                  className="bg-white border border-slate-200 text-teal-700 font-bold px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-sm"
                >
                  <option value="admin">Administrator (View All)</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>
                      Advisor: {adv.fullName} ({adv.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Profile & Logout Info */}
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 p-1.5 pr-3 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-teal-700 bg-teal-700 flex items-center justify-center font-bold text-xs uppercase text-white shadow-sm">
                {currentUser?.fullName.slice(0, 2)}
              </div>
              <div className="flex flex-col max-w-[120px] sm:max-w-[200px]">
                <span className="font-bold text-xs text-slate-800 truncate leading-none">{currentUser?.fullName}</span>
                <span className="text-[9px] font-black uppercase text-teal-700 mt-1">{currentUser?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="ml-2 w-8 h-8 rounded-lg bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center cursor-pointer transition border border-slate-200 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Layout */}
      <main className="flex-grow p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Header Title */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Briefcase className="w-8 h-8 text-teal-700" />
              Lead Management Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review qualifiers, track financial gap calculations, and log client contact details.</p>
          </div>
          
          <button 
            onClick={fetchData} 
            className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            Refresh Pipeline
          </button>
        </div>

        {/* Tab Buttons (ADMIN ONLY) */}
        {currentUser?.role === "ADMIN" && (
          <div className="flex space-x-2 border-b border-slate-200 pb-4 mb-6">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition ${
                activeTab === "pipeline"
                  ? "bg-teal-700 text-white shadow-md shadow-teal-700/10"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              Leads Pipeline
            </button>
            <button
              onClick={() => setActiveTab("advisors")}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition ${
                activeTab === "advisors"
                  ? "bg-teal-700 text-white shadow-md shadow-teal-700/10"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              Advisors Directory
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-150 p-4 rounded-2xl text-red-700 text-sm flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span><strong>Database Query Error:</strong> {error}. Make sure the database and migrations are fully running.</span>
          </div>
        )}

        {activeTab === "pipeline" ? (
          <>
            {/* KPIs Grid - Light theme cards matching landing page */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              
              {/* Card 1: Total Leads */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                <div className="absolute right-4 top-4 w-10 h-10 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Leads</span>
                  <h3 className="text-3xl font-black mt-2 text-slate-900">{loading ? "..." : totalLeadsCount}</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-3 flex items-center gap-1">
                  Active assigned records
                </p>
              </div>

              {/* Card 2: Hot Leads */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                <div className="absolute right-4 top-4 w-10 h-10 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <span className="text-[10px] text-red-650 font-extrabold uppercase tracking-widest">Hot Qualifier Leads</span>
                  <h3 className="text-3xl font-black mt-2 text-red-600">{loading ? "..." : hotLeadsCount}</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-3">
                  High score / large gaps identified
                </p>
              </div>

              {/* Card 3: Pending Follow-ups */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                <div className="absolute right-4 top-4 w-10 h-10 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <span className="text-[10px] text-sky-650 font-extrabold uppercase tracking-widest">Pending Status</span>
                  <h3 className="text-3xl font-black mt-2 text-sky-600">{loading ? "..." : pendingFollowups}</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-3">
                  Awaiting contact attempts
                </p>
              </div>

              {/* Card 4: Conversion Rate */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm">
                <div className="absolute right-4 top-4 w-10 h-10 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <span className="text-[10px] text-teal-700 font-extrabold uppercase tracking-widest">Pipeline Conversion</span>
                  <h3 className="text-3xl font-black mt-2 text-teal-700">{loading ? "..." : `${conversionRate}%`}</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-3">
                  Leads converted to clients
                </p>
              </div>

            </div>

            {/* Filters and List Panel */}
            <div className="bg-white border border-slate-200/85 rounded-3xl shadow-sm overflow-hidden">
              
              {/* Filters Bar */}
              <div className="p-6 border-b border-slate-200/60 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search leads by name or email..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-2xl pl-11 pr-4 py-3 outline-none text-sm transition text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>

                {/* Select Dropdowns */}
                <div className="flex gap-3 w-full md:w-auto justify-end">
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-500">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Filter By:</span>
                  </div>
                  
                  {/* Category Filter */}
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-sm"
                  >
                    <option value="all">All Category Levels</option>
                    <option value="HOT">Hot Leads</option>
                    <option value="WARM">Warm Leads</option>
                    <option value="COLD">Cold Leads</option>
                  </select>

                  {/* Status Filter */}
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-sm"
                  >
                    <option value="all">All Pipeline Statuses</option>
                    <option value="PENDING">Pending Update</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CONVERTED">Converted (Won)</option>
                    <option value="LOST">Lost / Unreachable</option>
                  </select>
                </div>

              </div>

              {/* Leads Table Container */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="py-20 text-center text-slate-450 flex flex-col justify-center items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Querying database...</span>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 flex flex-col justify-center items-center">
                    <Layers className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="font-bold text-slate-655 text-slate-700">No matching leads found</p>
                    <p className="text-xs text-slate-500 mt-1">Adjust your filter options or complete a diagnostic simulation on the landing page.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                        <th className="py-4 px-6">Lead Client</th>
                        <th className="py-4 px-6 text-center">Qualifier Score</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Pipeline Status</th>
                        <th className="py-4 px-6">Assigned Advisor</th>
                        <th className="py-4 px-6">Date Added</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.map((lead) => {
                        const status = lead.assignment?.status || "PENDING";
                        const isHot = lead.leadCategory === "HOT";
                        const isWarm = lead.leadCategory === "WARM";
                        
                        return (
                          <tr 
                            key={lead.id} 
                            className="hover:bg-slate-50/50 transition duration-150 cursor-pointer"
                            onClick={() => handleLeadClick(lead)}
                          >
                            {/* Name & Contact */}
                            <td className="py-4.5 px-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">{lead.fullName}</span>
                                <span className="text-xs text-slate-450 flex items-center gap-1 mt-0.5 font-medium">
                                  <Mail className="w-3 h-3 text-slate-400" /> {lead.email}
                                </span>
                              </div>
                            </td>
                            
                            {/* Score */}
                            <td className="py-4.5 px-6 text-center">
                              <div className="inline-flex items-center justify-center font-black text-sm px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-teal-700">
                                {lead.overallLeadScore}
                              </div>
                            </td>
                            
                            {/* Category Badge */}
                            <td className="py-4.5 px-6">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                                isHot 
                                  ? "bg-red-50 text-red-650 border border-red-100" 
                                  : isWarm 
                                    ? "bg-amber-50 text-amber-700 border border-amber-100" 
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}>
                                {isHot && <Flame className="w-3 h-3 text-red-500" />}
                                {lead.leadCategory}
                              </span>
                            </td>
                            
                            {/* Status Badge */}
                            <td className="py-4.5 px-6">
                              <span className={`inline-flex items-center text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                                status === "CONVERTED"
                                  ? "bg-teal-50 text-teal-700 border border-teal-100"
                                  : status === "CONTACTED"
                                    ? "bg-sky-50 text-sky-700 border border-sky-100"
                                    : status === "LOST"
                                      ? "bg-red-50 text-red-650 border border-red-100"
                                      : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}>
                                {status === "CONVERTED" && <Check className="w-3 h-3 mr-1" />}
                                {status}
                              </span>
                            </td>
                            
                            {/* Advisor */}
                            <td className="py-4.5 px-6">
                              <span className="text-xs text-slate-700 font-bold">
                                {lead.assignment?.advisorName || "Unassigned"}
                              </span>
                            </td>

                            {/* Date Added */}
                            <td className="py-4.5 px-6">
                              <span className="text-xs text-slate-400 font-semibold">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            
                            {/* Actions */}
                            <td className="py-4.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => handleLeadClick(lead)}
                                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-extrabold py-2 px-4 rounded-xl transition duration-150 cursor-pointer inline-flex items-center gap-1 shadow-sm"
                              >
                                Review
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Advisors Management Tab (ADMIN ONLY) */
          <div className="bg-white border border-slate-200/85 rounded-3xl shadow-sm overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registered Advisors</h2>
                <p className="text-slate-500 text-xs mt-1">Manage platform credentials, roles, and status flags.</p>
              </div>
              <button
                onClick={() => openAdvisorModal(null)}
                className="bg-teal-700 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Advisor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                    <th className="py-4 px-6">Advisor & Title</th>
                    <th className="py-4 px-6">Referral Code & Link</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Phone Number</th>
                    <th className="py-4 px-6">Role & Defaults</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advisors.map((adv) => (
                    <tr key={adv.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-black text-sm shrink-0 overflow-hidden border border-teal-200 shadow-sm">
                            {adv.avatarUrl ? (
                              <img src={adv.avatarUrl} alt={adv.fullName} className="w-full h-full object-cover" />
                            ) : (
                              adv.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{adv.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{adv.title || "Senior Wealth Planner"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {adv.advisorCode || "—"}
                          </span>
                          {adv.advisorCode && (
                            <button
                              type="button"
                              onClick={() => copyReferralLink(adv.advisorCode)}
                              title={`Copy referral link for ${adv.advisorCode}`}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded transition cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              Copy Link
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-xs text-slate-500">{adv.email}</td>
                      <td className="py-4.5 px-6 text-xs text-slate-500">{adv.phone || "—"}</td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            adv.role === "ADMIN" 
                              ? "bg-teal-50 text-teal-700 border border-teal-200/50" 
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {adv.role}
                          </span>
                          {adv.isDefault && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200" title="Default fallback for leads without referral code">
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <span className={`inline-flex items-center text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          adv.status === "ACTIVE"
                            ? "bg-teal-50 text-teal-700 border border-teal-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {adv.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAdvisorModal(adv)}
                            title="Edit details / reset password"
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-2 rounded-lg transition cursor-pointer shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAdvisor(adv.id, adv.fullName)}
                            disabled={adv.id === currentUser?.id}
                            title={adv.id === currentUser?.id ? "You cannot delete yourself" : "Delete advisor"}
                            className="bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 p-2 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Slide-over Details Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
          
          {/* Drawer Box */}
          <div className="relative w-full max-w-2xl bg-white border-l border-slate-200/80 shadow-2xl h-full flex flex-col z-10 animate-slide-in">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200/80 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedLead.fullName}</h3>
                  <p className="text-xs text-slate-550 mt-0.5">Assigned to: <strong className="text-slate-700">{selectedLead.assignment?.advisorName || "Unassigned"}</strong></p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedLead(null)} 
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Details Body */}
            <div className="flex-grow p-6 overflow-y-auto space-y-8 bg-slate-50/20">
              
              {/* Contact Card */}
              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-3.5">
                <h4 className="text-[10px] text-teal-700 font-extrabold uppercase tracking-widest">Client Contact Profile</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block">Email Address</span>
                    <a href={`mailto:${selectedLead.email}`} className="text-slate-700 font-bold hover:underline flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      {selectedLead.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Mobile Number</span>
                    <span className="text-slate-700 font-bold flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      {selectedLead.mobileNumber || "Not Provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 48-Hour VIP Strategy Brief Activity Card */}
              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] text-teal-700 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    48-Hour Strategy Brief Activity
                  </h4>
                  {(selectedLead.insightsViewCount ?? 0) > 0 ? (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 border border-teal-200">
                      🔥 Active Engagement
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                      Not Opened Yet
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block">Total Link Views</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                      {selectedLead.insightsViewCount ?? 0} {(selectedLead.insightsViewCount ?? 0) === 1 ? "Time" : "Times"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Last Viewed On</span>
                    <span className="text-slate-900 font-bold text-xs mt-0.5 block">
                      {selectedLead.lastViewedInsightsAt 
                        ? new Date(selectedLead.lastViewedInsightsAt).toLocaleString() 
                        : "Awaiting Client Access"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Baseline Profile */}
              {selectedLead.profile ? (
                <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl">
                  <h4 className="text-[10px] text-teal-700 font-extrabold uppercase tracking-widest mb-4">Financial Baseline Details</h4>
                  
                  <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-xs">
                    <div>
                      <span className="text-slate-550 font-semibold text-slate-500">Age</span>
                      <p className="text-slate-800 font-bold mt-1 text-sm">{selectedLead.profile.age} Years Old</p>
                    </div>
                    <div>
                      <span className="text-slate-550 font-semibold text-slate-500">Marital Status</span>
                      <p className="text-slate-800 font-bold mt-1 text-sm uppercase">{selectedLead.profile.maritalStatus}</p>
                    </div>
                    <div>
                      <span className="text-slate-550 font-semibold text-slate-500">Dependents Count</span>
                      <p className="text-slate-800 font-bold mt-1 text-sm">{selectedLead.profile.dependentsCount} Kids</p>
                    </div>
                    <div>
                      <span className="text-slate-550 font-semibold text-slate-500">Monthly Income Range</span>
                      <p className="text-slate-800 font-bold mt-1 text-sm">{selectedLead.profile.monthlyIncomeRange}</p>
                    </div>
                    <div>
                      <span className="text-slate-550 font-semibold text-slate-500">Initial Liquid Savings</span>
                      <p className="text-slate-800 font-bold mt-1 text-sm">₱{Number(selectedLead.profile.currentSavings).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-550 font-semibold text-slate-500">Retirement Age Goal</span>
                      <p className="text-slate-800 font-bold mt-1 text-sm">{selectedLead.profile.retirementAgeGoal} Years Old</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl text-center text-slate-400">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-500">No Financial Profile Recorded</p>
                  <p className="text-[10px] text-slate-450 mt-1">Lead signed up with name and email only. No calculator math was saved.</p>
                </div>
              )}

              {/* Financial Gaps Analysis (The 5 Pillars) */}
              {selectedLead.profile && getPillarCalculations(selectedLead) && (
                <div className="space-y-4">
                  <h4 className="text-[10px] text-teal-700 font-extrabold uppercase tracking-widest">Financial Safety Nets Gap Analysis</h4>
                  
                  {(() => {
                    const calc = getPillarCalculations(selectedLead)!;
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Pillar 1: Savings */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Pillar 1: Accumulation (Savings)</span>
                            <span className="text-[11px] text-slate-600 mt-1.5 block">Projected Total ({calc.milestone.years} yrs):</span>
                            <span className="font-extrabold text-teal-700 text-base block mt-0.5">₱{calc.milestone.projectedTotal.toLocaleString()}</span>
                          </div>
                          <span className="text-[9.5px] text-slate-450 mt-2 block font-medium">Monthly contribution: ₱{calc.milestone.monthlyContribution.toLocaleString()} at {calc.milestone.expectedReturn}% return.</span>
                        </div>

                        {/* Pillar 2: Retirement */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Pillar 2: Retirement Readiness</span>
                            <span className="text-[11px] text-slate-600 mt-1.5 block">Capitalization Gap:</span>
                            <span className={`font-extrabold text-base block mt-0.5 ${calc.retirement.gap > 0 ? "text-red-600" : "text-teal-700"}`}>
                              ₱{Math.round(calc.retirement.gap).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[9.5px] text-slate-450 mt-2 block font-medium">Desired: ₱{calc.retirement.expenses.toLocaleString()}/mo. Target: ₱{Math.round(calc.retirement.target).toLocaleString()}</span>
                        </div>

                        {/* Pillar 3: Income Protection */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Pillar 3: Family Income Protection</span>
                            <span className="text-[11px] text-slate-600 mt-1.5 block">Coverage Shortfall:</span>
                            <span className={`font-extrabold text-base block mt-0.5 ${calc.income.gap > 0 ? "text-red-600" : "text-teal-700"}`}>
                              ₱{Math.round(calc.income.gap).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[9.5px] text-slate-450 mt-2 block font-medium">Lump Sum Target: ₱{Math.round(calc.income.target).toLocaleString()}</span>
                        </div>

                        {/* Pillar 4: Health */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Pillar 4: Critical Illness Buffer</span>
                            <span className="text-[11px] text-slate-600 mt-1.5 block">Vulnerability Gap:</span>
                            <span className={`font-extrabold text-base block mt-0.5 ${calc.health.gap > 0 ? "text-red-600" : "text-teal-700"}`}>
                              ₱{calc.health.gap.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[9.5px] text-slate-450 mt-2 block font-medium">Desired: ₱{calc.health.desired.toLocaleString()} | Has: ₱{calc.health.existing.toLocaleString()}</span>
                        </div>

                        {/* Pillar 5: Education */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 flex flex-col justify-between md:col-span-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Pillar 5: Education Funding ({calc.education.childName})</span>
                              <span className="text-[11px] text-slate-600 mt-1.5 block">College Target Shortfall (4-Yr Course):</span>
                              <span className={`font-extrabold text-base block mt-0.5 ${calc.education.gap > 0 ? "text-red-600" : "text-teal-700"}`}>
                                ₱{Math.round(calc.education.gap).toLocaleString()}
                              </span>
                            </div>
                            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] text-right font-bold text-slate-500 mt-1.5 shadow-sm">
                              Enters College in: {calc.education.yearsToCollege} Years
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>
              )}

              {/* CRM Update Logs */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                <h4 className="text-[10px] text-teal-700 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-700" />
                  Advisor Action Notes & pipeline Status
                </h4>

                <div className="space-y-4">
                  {/* Status update */}
                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">Advisory Pipeline Status</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["PENDING", "CONTACTED", "CONVERTED", "LOST"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusInput(st)}
                          className={`py-2 px-2 text-[10px] font-black rounded-xl border transition cursor-pointer text-center uppercase tracking-wider ${
                            statusInput === st
                              ? "bg-teal-50 border-teal-600 text-teal-700 shadow-sm"
                              : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-350"
                          }`}
                        >
                          {st === "CONVERTED" ? "CONVERTED" : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes update */}
                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-550 uppercase tracking-wide mb-2">Communication & Advisory logs</label>
                    <textarea
                      rows={4}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Add logging of client calls, advisor assignments updates, and Sun Life insurance recommendations here..."
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl p-3 outline-none text-xs text-slate-900 placeholder-slate-400 transition focus:ring-1 focus:ring-teal-500/20 leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isUpdating}
                    className="w-full bg-teal-700 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-700/10"
                  >
                    {isUpdating ? "Syncing database..." : "Save Notes & Pipeline Status"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Advisor CRUD Modal */}
      {showAdvisorModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdvisorModal(false)}></div>
          
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-teal-600 to-transparent"></div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingAdvisor ? `Edit Advisor: ${editingAdvisor.fullName}` : "Add New Advisor Account"}
              </h3>
              <button
                onClick={() => setShowAdvisorModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {advisorError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-650 p-3 rounded-xl mb-4 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{advisorError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdvisor} className="space-y-4">
              {/* Profile Picture / Avatar Section with Upload & Crop */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Advisor Profile Picture
                  </label>
                  {advisorForm.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAdvisorForm({ ...advisorForm, avatarUrl: "" })}
                      className="text-[10px] text-red-600 hover:underline cursor-pointer font-bold"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div className="flex items-start gap-4">
                  {/* Clickable Avatar Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to upload and crop photo"
                    className="group relative w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-2xl shrink-0 overflow-hidden border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-teal-500 transition"
                  >
                    {advisorForm.avatarUrl ? (
                      <img
                        src={advisorForm.avatarUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      advisorForm.fullName ? advisorForm.fullName.charAt(0) : "A"
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[9px] font-bold">
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>Upload</span>
                    </div>
                  </div>

                  {/* Actions & URL Option */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload & Crop Photo
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        value={advisorForm.avatarUrl}
                        onChange={(e) => setAdvisorForm({ ...advisorForm, avatarUrl: e.target.value })}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>

                    {/* Quick Preset Avatars */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold">Sample:</span>
                      <button
                        type="button"
                        onClick={() => setAdvisorForm({ ...advisorForm, avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80" })}
                        className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition cursor-pointer font-medium"
                      >
                        Female 1
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdvisorForm({ ...advisorForm, avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80" })}
                        className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition cursor-pointer font-medium"
                      >
                        Male 1
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdvisorForm({ ...advisorForm, avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80" })}
                        className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition cursor-pointer font-medium"
                      >
                        Female 2
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={advisorForm.fullName}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, fullName: e.target.value })}
                    placeholder="e.g. Arthur Pendragon"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Advisor Code *</label>
                  <input
                    type="text"
                    required
                    value={advisorForm.advisorCode}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, advisorCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                    placeholder="e.g. ARTHUR"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={advisorForm.email}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, email: e.target.value })}
                    placeholder="e.g. arthur@projectkintsugi.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Professional Title</label>
                  <input
                    type="text"
                    value={advisorForm.title}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, title: e.target.value })}
                    placeholder="e.g. Senior Wealth Planner"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={advisorForm.phone}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, phone: e.target.value })}
                    placeholder="e.g. 0917-123-4567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Calendly / Booking Link</label>
                  <input
                    type="url"
                    value={advisorForm.calendlyUrl}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, calendlyUrl: e.target.value })}
                    placeholder="https://calendly.com/your-name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">System Role</label>
                  <select
                    value={advisorForm.role}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, role: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                  >
                    <option value="ADVISOR">ADVISOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Status Flag</label>
                  <select
                    value={advisorForm.status}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password {editingAdvisor && <span className="text-[10px] text-slate-400 lowercase">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    required={!editingAdvisor}
                    value={advisorForm.password}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              {/* Set as Default Advisor Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                  <input
                    type="checkbox"
                    checked={advisorForm.isDefault}
                    onChange={(e) => setAdvisorForm({ ...advisorForm, isDefault: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Set as Default Advisor</span>
                    <span className="text-[11px] text-slate-500">Assign non-referral leads to this advisor automatically and show on public root URL without ?ref parameter.</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvisorModal(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 py-3 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={advisorSaving}
                  className="flex-1 bg-teal-700 hover:bg-teal-700 text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-sm"
                >
                  {advisorSaving ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Image Cropper Modal */}
      {showCropperModal && rawImageSrc && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" onClick={() => setShowCropperModal(false)}></div>
          
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden text-center">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <Crop className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Crop & Adjust Portrait</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCropperModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-4">
              Drag photo to reposition. Use the zoom slider to scale.
            </p>

            {/* Cropper Viewport */}
            <div
              className="relative w-[260px] h-[260px] mx-auto rounded-full overflow-hidden border-4 border-teal-600 shadow-xl bg-slate-900 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handlePanMove(e.clientX, e.clientY)}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
              onTouchStart={(e) => {
                if (e.touches.length > 0) handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchMove={(e) => {
                if (e.touches.length > 0) handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchEnd={handlePanEnd}
            >
              <img
                ref={imagePreviewRef}
                src={rawImageSrc}
                alt="Cropper Source"
                onLoad={handleImageLoaded}
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${cropPan.x}px), calc(-50% + ${cropPan.y}px)) scale(${cropZoom})`,
                  transformOrigin: "center center",
                  maxWidth: "none",
                  maxHeight: "none",
                  width: naturalSize.width ? (naturalSize.width > naturalSize.height ? "auto" : "100%") : "100%",
                  height: naturalSize.height ? (naturalSize.height >= naturalSize.width ? "auto" : "100%") : "100%",
                  pointerEvents: "none",
                }}
              />

              {/* Target Overlay Guides */}
              <div className="absolute inset-0 pointer-events-none border border-white/40 rounded-full"></div>
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-white/30">
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div></div>
              </div>
            </div>

            {/* Controls: Zoom Slider & Reset */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 px-2 bg-slate-50 py-2 rounded-xl border border-slate-200/80">
                <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <ZoomIn className="w-4 h-4 text-teal-700 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setCropZoom(1);
                    setCropPan({ x: 0, y: 0 });
                  }}
                  title="Reset position and zoom"
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0 transition cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCropperModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast System */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 text-slate-950 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 z-[150] flex items-center border-l-4 border-teal-500 max-w-sm">
          <div className="w-8 h-8 bg-teal-600/10 rounded-full flex items-center justify-center mr-3 shrink-0">
            <Check className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-slate-800">{toast.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Inline styles for slide-in drawer animation */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
}
