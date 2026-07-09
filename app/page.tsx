"use client";

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { 
  TrendingUp, 
  ShieldAlert, 
  HeartPulse, 
  GraduationCap, 
  Lock, 
  Unlock, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Check, 
  Sparkles, 
  Calculator, 
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function Home() {
  // Application State
  const [isLocked, setIsLocked] = useState(true);
  const [showGate, setShowGate] = useState(false);
  const [activeTab, setActiveTab] = useState("tab-milestone");
  const [toast, setToast] = useState<{ title: string; message: string; visible: boolean }>({
    title: "",
    message: "",
    visible: false
  });
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);

  // Calculator inputs (adjusted to local Philippine Peso scales)
  const [initialSavings, setInitialSavings] = useState(100000); // ₱100k
  const [monthlyContribution, setMonthlyContribution] = useState(5000); // ₱5k
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(7.0);

  // Gated dashboard FNA inputs
  const [clientAge, setClientAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [retExpenses, setRetExpenses] = useState(50000); // ₱50k/mo
  const [retPension, setRetPension] = useState(0);

  const [maritalStatus, setMaritalStatus] = useState("SINGLE");
  const [dependentsCount, setDependentsCount] = useState(0);
  const [monthlyIncomeRange, setMonthlyIncomeRange] = useState("₱30,000 - ₱50,000");

  const [childName, setChildName] = useState("Junior");
  const [childAge, setChildAge] = useState(5);
  const [annualTuition, setAnnualTuition] = useState(100000);
  const [courseDuration, setCourseDuration] = useState(4); // 4 years default

  const [protExpenses, setProtExpenses] = useState(50000);
  const [protInterest, setProtInterest] = useState(6); // 6% capitalization
  const [protLiabilities, setProtLiabilities] = useState(200000);
  const [protEmergency, setProtEmergency] = useState(100000);
  const [protFinal, setProtFinal] = useState(50000);
  const [protExisting, setProtExisting] = useState(1000000);

  const [desiredHealth, setDesiredHealth] = useState(2000000); // 2M pesos
  const [existingHealth, setExistingHealth] = useState(500000);

  // Gated dashboard active pillars toggles
  const [includeRetirement, setIncludeRetirement] = useState(true);
  const [includeIncome, setIncludeIncome] = useState(true);
  const [includeEducation, setIncludeEducation] = useState(true);
  const [includeHealth, setIncludeHealth] = useState(true);

  // Calculated values
  const [projectedTotal, setProjectedTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Gated Reactive Calculations
  const yearsToRetire = Math.max(0, retirementAge - clientAge);
  const futureAnnualExpenses = (retExpenses * 12) * Math.pow(1.04, yearsToRetire); // 4% inflation
  
  // Retirement capitalization (Living on Interest)
  const retirementTarget = futureAnnualExpenses / 0.06; // 6% capitalization
  const pensionLumpSum = (retPension * 12) / 0.06;
  const retirementGap = Math.max(0, retirementTarget - pensionLumpSum - projectedTotal);

  // Retirement Sinking Fund (20-year depletion)
  const retirementTargetSinking = futureAnnualExpenses * 20;
  const retirementGapSinking = Math.max(0, retirementTargetSinking - pensionLumpSum - projectedTotal);

  // Education: 4-Year and 5-Year College cost projections (8% inflation)
  const yearsToCollege = Math.max(0, 18 - childAge);
  const t1 = annualTuition * Math.pow(1.08, yearsToCollege);
  const t2 = annualTuition * Math.pow(1.08, yearsToCollege + 1);
  const t3 = annualTuition * Math.pow(1.08, yearsToCollege + 2);
  const t4 = annualTuition * Math.pow(1.08, yearsToCollege + 3);
  const t5 = annualTuition * Math.pow(1.08, yearsToCollege + 4);

  const educationTarget4 = t1 + t2 + t3 + t4;
  const educationTarget5 = t1 + t2 + t3 + t4 + t5;
  const educationGap4 = Math.max(0, educationTarget4 - 120000);
  const educationGap5 = Math.max(0, educationTarget5 - 120000);

  const amountNeededToProvide = (protExpenses * 12) / (protInterest / 100);
  const totalLiabilities = protLiabilities + protEmergency + protFinal;
  const totalCashAssets = protExisting + initialSavings;
  const incomeTarget = amountNeededToProvide + totalLiabilities;
  const incomeGap = Math.max(0, incomeTarget - totalCashAssets);

  const healthGap = Math.max(0, desiredHealth - existingHealth);

  // Chart refs
  const milestoneChartRef = useRef<HTMLCanvasElement>(null);
  const milestoneChartInstance = useRef<Chart | null>(null);

  const retirementChartRef = useRef<HTMLCanvasElement>(null);
  const retirementChartInstance = useRef<Chart | null>(null);

  const educationChartRef = useRef<HTMLCanvasElement>(null);
  const educationChartInstance = useRef<Chart | null>(null);

  const incomeChartRef = useRef<HTMLCanvasElement>(null);
  const incomeChartInstance = useRef<Chart | null>(null);

  const healthChartRef = useRef<HTMLCanvasElement>(null);
  const healthChartInstance = useRef<Chart | null>(null);

  // Trigger Toast helper
  const triggerToast = (title: string, message: string) => {
    setToast({ title, message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Live update of Milestone calculations & Chart update
  useEffect(() => {
    const p = initialSavings;
    const pmt = monthlyContribution;
    const y = years;
    const r = expectedReturn / 100;
    const monthlyRate = r / 12;

    let balance = p;
    const labels: string[] = [];
    const data: number[] = [];
    const interval = Math.max(1, Math.floor(y / 10));

    for (let i = 0; i <= y; i++) {
      if (i === 0) {
        labels.push("Now");
        data.push(Math.round(balance));
      } else {
        // Calculate balance for this year
        for (let m = 0; m < 12; m++) {
          balance = (balance + pmt) * (1 + monthlyRate);
        }
        if (i % interval === 0 || i === y) {
          labels.push(`Yr ${i}`);
          data.push(Math.round(balance));
        }
      }
    }

    setProjectedTotal(Math.round(balance));

    // Update or Create Chart
    if (milestoneChartRef.current) {
      const ctx = milestoneChartRef.current.getContext("2d");
      if (ctx) {
        if (!milestoneChartInstance.current) {
          // Create Gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(20, 184, 166, 0.4)"); // teal-500
          gradient.addColorStop(1, "rgba(20, 184, 166, 0.0)");

          milestoneChartInstance.current = new Chart(milestoneChartRef.current, {
            type: "line",
            data: {
              labels,
              datasets: [{
                label: "Projected Value (₱)",
                borderColor: "#0f766e", // teal-700
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#0d9488",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                data,
                fill: true,
                tension: 0.4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "rgba(17, 24, 39, 0.9.5)",
                  padding: 12,
                  titleFont: { size: 14, weight: "bold" },
                  bodyFont: { size: 14 },
                  callbacks: {
                    label: (context) => "₱" + (context.parsed?.y?.toLocaleString() ?? "0")
                  }
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { weight: 500 } }
                },
                y: {
                  grid: { color: "#f3f4f6" },
                  ticks: {
                    callback: (value) => "₱" + (Number(value) >= 1000 ? (Number(value) / 1000) + "k" : value),
                    font: { weight: 500 }
                  }
                }
              }
            }
          });
        } else {
          milestoneChartInstance.current.data.labels = labels;
          milestoneChartInstance.current.data.datasets[0].data = data;
          milestoneChartInstance.current.update();
        }
      }
    }
  }, [initialSavings, monthlyContribution, years, expectedReturn]);

  // Handle Clean Cleanup of Charts
  useEffect(() => {
    return () => {
      if (milestoneChartInstance.current) milestoneChartInstance.current.destroy();
      if (retirementChartInstance.current) retirementChartInstance.current.destroy();
      if (educationChartInstance.current) educationChartInstance.current.destroy();
      if (incomeChartInstance.current) incomeChartInstance.current.destroy();
      if (healthChartInstance.current) healthChartInstance.current.destroy();
    };
  }, []);

  // Initialize or Update Gated Dashboard Charts
  const initDashboardCharts = () => {
    // 1. Retirement Chart
    if (retirementChartRef.current) {
      const retirementData = [retirementTarget, retirementTargetSinking, projectedTotal + pensionLumpSum];
      if (retirementChartInstance.current) {
        retirementChartInstance.current.data.datasets[0].data = retirementData;
        retirementChartInstance.current.update();
      } else {
        retirementChartInstance.current = new Chart(retirementChartRef.current, {
          type: "bar",
          data: {
            labels: ["Capitalization Target", "Sinking Fund Target", "Current Savings + Pension"],
            datasets: [{
              data: retirementData,
              backgroundColor: ["#0f766e", "#0284c7", "#14b8a6"],
              borderRadius: 8,
              barPercentage: 0.6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (c) => "₱" + (c.parsed?.y?.toLocaleString() ?? "0") } }
            },
            scales: {
              y: { ticks: { callback: v => "₱" + (Number(v) >= 1000000 ? (Number(v)/1000000) + "M" : v) } }
            }
          }
        });
      }
    }

    // 2. Education Chart
    if (educationChartRef.current) {
      const labels = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
      const data = [t1, t2, t3, t4, t5];

      if (educationChartInstance.current) {
        educationChartInstance.current.data.labels = labels;
        educationChartInstance.current.data.datasets[0].data = data;
        educationChartInstance.current.update();
      } else {
        educationChartInstance.current = new Chart(educationChartRef.current, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Future Tuition Cost (Inflated at 8%)",
              data: data,
              backgroundColor: "#0f766e",
              borderRadius: 6,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: "bottom" },
              tooltip: { callbacks: { label: (c) => "₱" + (c.parsed?.y?.toLocaleString() ?? "0") } }
            },
            scales: {
              y: { ticks: { callback: v => "₱" + (Number(v) >= 100000 ? (Number(v)/1000) + "k" : v) } }
            }
          }
        });
      }
    }

    // 3. Income Protection Chart
    if (incomeChartRef.current) {
      if (incomeChartInstance.current) {
        incomeChartInstance.current.data.datasets[0].data = [totalCashAssets, incomeGap];
        incomeChartInstance.current.update();
      } else {
        incomeChartInstance.current = new Chart(incomeChartRef.current, {
          type: "doughnut",
          data: {
            labels: ["Current Assets + Savings", "Unprotected Gap"],
            datasets: [{
              data: [totalCashAssets, incomeGap],
              backgroundColor: ["#0f766e", "#f87171"],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "75%",
            plugins: {
              legend: { position: "bottom" }
            }
          }
        });
      }
    }

    // 4. Health Coverage Chart
    if (healthChartRef.current) {
      if (healthChartInstance.current) {
        healthChartInstance.current.data.datasets[0].data = [desiredHealth, existingHealth, healthGap];
        healthChartInstance.current.update();
      } else {
        healthChartInstance.current = new Chart(healthChartRef.current, {
          type: "bar",
          data: {
            labels: ["Desired Coverage", "Existing Coverage", "Shortfall Gap"],
            datasets: [{
              data: [desiredHealth, existingHealth, healthGap],
              backgroundColor: ["#0f766e", "#14b8a6", "#ef4444"],
              borderRadius: 8,
              barPercentage: 0.5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (c) => "₱" + (c.parsed?.y?.toLocaleString() ?? "0") } }
            },
            scales: {
              y: { ticks: { callback: v => "₱" + (Number(v) >= 1000000 ? (Number(v)/1000000) + "M" : v) } }
            }
          }
        });
      }
    }
  };

  // Switch tabs inside gated dashboard
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Scroll Helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Unlock Trigger
  const handleUnlockClick = () => {
    if (!isLocked) {
      scrollToSection("full-dashboard");
      return;
    }
    setShowGate(true);
  };

  // Save Lead and Calculations State to DB
  const saveAssessment = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name,
        email,
        mobile,
        inputs: {
          initialSavings,
          monthlyContribution,
          years,
          expectedReturn,
          age: clientAge,
          retirementAgeGoal: retirementAge,
          retExpenses,
          retPension,
          childName,
          childAge,
          annualTuition,
          courseDuration,
          protExpenses,
          protInterest,
          protLiabilities,
          protEmergency,
          protFinal,
          protExisting,
          desiredHealth,
          existingHealth,
          maritalStatus,
          dependentsCount,
          monthlyIncomeRange,
          includeRetirement,
          includeIncome,
          includeEducation,
          includeHealth
        },
        outputs: {
          projectedTotal,
          retirementTarget,
          retirementGap,
          retirementTargetSinking,
          retirementGapSinking,
          educationTarget4,
          educationTarget5,
          educationGap4,
          educationGap5,
          incomeTarget,
          incomeGap,
          healthGap
        }
      };

      const response = await fetch("/api/leads/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit lead data.");
      }

      triggerToast("Sync Complete", "Dynamic scores and gaps saved successfully.");
    } catch (err: any) {
      console.error(err);
      triggerToast("Sync Error", err?.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  // Form Submission (Soft Gate)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAssessment();
    setShowGate(false);
    setIsLocked(false);
    setTimeout(() => {
      scrollToSection("full-dashboard");
    }, 300);
  };

  // PDF Generation Integration
  const handlePdfDownload = async () => {
    setIsPdfGenerating(true);
    try {
      const payload = {
        name,
        email,
        mobile,
        inputs: {
          initialSavings,
          monthlyContribution,
          years,
          expectedReturn,
          age: clientAge,
          retirementAgeGoal: retirementAge,
          retExpenses,
          retPension,
          childName,
          childAge,
          annualTuition,
          courseDuration,
          protExpenses,
          protInterest,
          protLiabilities,
          protEmergency,
          protFinal,
          protExisting,
          desiredHealth,
          existingHealth,
          maritalStatus,
          dependentsCount,
          monthlyIncomeRange,
          includeRetirement,
          includeIncome,
          includeEducation,
          includeHealth
        },
        outputs: {
          projectedTotal,
          retirementTarget,
          retirementGap,
          retirementTargetSinking,
          retirementGapSinking,
          educationTarget4,
          educationTarget5,
          educationGap4,
          educationGap5,
          incomeTarget,
          incomeGap,
          healthGap
        }
      };

      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to generate report.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FreyaFNA_Report_${name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      triggerToast("Report Generated!", "Your PDF report was downloaded successfully.");
    } catch (err: any) {
      console.error(err);
      triggerToast("PDF Error", "Failed to compile the report.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Re-trigger dynamic Chart updates when input values change
  useEffect(() => {
    if (!isLocked) {
      initDashboardCharts();
    }
  }, [
    isLocked,
    projectedTotal,
    clientAge,
    retirementAge,
    retExpenses,
    retPension,
    childAge,
    annualTuition,
    courseDuration,
    protExpenses,
    protInterest,
    protLiabilities,
    protEmergency,
    protFinal,
    protExisting,
    desiredHealth,
    existingHealth
  ]);



  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection("hero")}>
            <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-inner">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-teal-950 leading-none">
                Freya<span className="text-teal-600">FNA</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Financial Needs Analysis</span>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-teal-800 transition duration-200 cursor-pointer">
              How it Works
            </button>
            <button onClick={() => scrollToSection("about")} className="hover:text-teal-800 transition duration-200 cursor-pointer">
              Advisor Profile
            </button>
          </div>
          
          <button 
            onClick={() => scrollToSection("calculator-section")} 
            className="bg-teal-800 hover:bg-teal-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition duration-200 shadow-md shadow-teal-900/10 cursor-pointer"
          >
            Start Analysis
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section id="hero" className="relative bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 py-24 md:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-10 w-3/4 h-3/4 bg-teal-800/40 rounded-full blur-3xl transform translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-bold tracking-wider mb-8 uppercase animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Free Interactive Diagnostic
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.15]">
              Identify & Secure Your <br />
              <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-300 bg-clip-text text-transparent">
                Future Financial Needs
              </span> with FreyaFNA.
            </h1>
            <p className="text-lg md:text-xl text-teal-100/90 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Assess your financial security, wealth and wellness, and future financial needs. Start with a free savings check, then unlock a dynamic 5-pillar scorecard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => scrollToSection("calculator-section")} 
                className="w-full sm:w-auto bg-white text-teal-950 hover:bg-slate-50 px-8 py-4 rounded-2xl font-bold text-lg transition duration-300 shadow-xl shadow-teal-950/20 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Analyze Savings Growth
              </button>
              <p className="text-teal-200 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-400" />
                No commitments or cards
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">The FreyaFNA Pathway</h2>
              <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">Four steps to mapping, optimizing, and protecting your financial future.</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center font-black text-xl mb-6 shadow-inner">
                  1
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Test Your Trajectory</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Input your current assets, contributions, and returns using the savings growth diagnostics below.</p>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center font-black text-xl mb-6 shadow-inner">
                  2
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Register Your Details</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Enter your name and details to gain access to rest of the FNA calculators.</p>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center font-black text-xl mb-6 shadow-inner">
                  3
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">View Financial Scorecard</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Review real-time target metrics and gap scores across savings, health, retirement, and family security.</p>
              </div>

              {/* Step 4 */}
              <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center font-black text-xl mb-6 shadow-inner">
                  4
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Get Actionable PDF</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Download a professional summary and sync with a licensed specialist to bridge your unprotected shortfalls.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Free Milestone Calculator Section */}
        <section id="calculator-section" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Milestone Savings Calculator</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">See how compound growth builds your cash reserve. Unlock the dashboard to map your other critical needs.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden lg:flex">
            
            {/* Input Sliders */}
            <div className="lg:w-5/12 p-8 md:p-12 bg-slate-50/80 border-r border-slate-100">
              <h3 className="text-xl font-bold text-slate-950 mb-8 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-700" />
                Your Inputs
              </h3>
              
              <div className="space-y-8">
                {/* Initial Savings */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">Initial Savings</label>
                    <span className="text-teal-800 font-extrabold text-lg">₱{initialSavings.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000" 
                    value={initialSavings} 
                    onChange={(e) => setInitialSavings(Number(e.target.value))}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>₱0</span>
                    <span>₱1,000,000</span>
                  </div>
                </div>

                {/* Monthly Savings */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">Monthly Contribution</label>
                    <span className="text-teal-800 font-extrabold text-lg">₱{monthlyContribution.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100000" 
                    step="500" 
                    value={monthlyContribution} 
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>₱0</span>
                    <span>₱100,000 / mo</span>
                  </div>
                </div>

                {/* Years */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">Time Horizon</label>
                    <span className="text-teal-800 font-extrabold text-lg">{years} Years</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    step="1" 
                    value={years} 
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>1 Year</span>
                    <span>40 Years</span>
                  </div>
                </div>

                {/* Return Rate */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">Projected Annual Return</label>
                    <span className="text-teal-800 font-extrabold text-lg">{expectedReturn.toFixed(1)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="15" 
                    step="0.1" 
                    value={expectedReturn} 
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>1%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projection Chart & Gate Trigger */}
            <div className="lg:w-7/12 p-8 md:p-12 flex flex-col justify-between bg-white">
              <div className="mb-6">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Projected Future Value</p>
                <h3 className="text-4xl sm:text-5xl font-black text-teal-850 tracking-tight">
                  ₱{projectedTotal.toLocaleString()}
                </h3>
              </div>
              
              <div className="chart-container flex-grow w-full relative min-h-[300px]">
                <canvas ref={milestoneChartRef} id="milestoneChart"></canvas>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <button 
                  onClick={handleUnlockClick} 
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white py-4 px-10 rounded-2xl font-bold text-lg transition duration-200 shadow-xl shadow-teal-800/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5 text-teal-300" />
                  Unlock Full 5-Pillar Dashboard
                </button>
                <p className="text-xs text-slate-400 font-medium mt-3">
                  See recommendations for Education, Retirement & Health Protection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Soft Gate Modal Overlay */}
        {showGate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 transition-opacity">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGate(false)}></div>
            
            {/* Modal Box */}
            <div className="relative bg-white w-full max-w-lg p-8 md:p-10 rounded-3xl shadow-2xl z-10 transform scale-100 transition-transform">
              <button 
                onClick={() => setShowGate(false)} 
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-650 transition cursor-pointer"
              >
                <span className="text-2xl font-bold">×</span>
              </button>

              <div className="text-center mb-8">
                <div className="mx-auto w-14 h-14 bg-teal-100 text-teal-750 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Unlock Full Assessment</h3>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                  Submit details to generate your **Financial Persona**, map out 4 supplementary calculation tools, and download a custom PDF analysis.
                </p>
              </div>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Dela Cruz" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition bg-slate-50 focus:bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan.delacruz@example.com" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition bg-slate-50 focus:bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="0917-000-0000" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none transition bg-slate-50 focus:bg-white text-sm"
                  />
                </div>
                <div className="flex items-start pt-2">
                  <input 
                    type="checkbox" 
                    required 
                    id="consent-check"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-5 w-5 text-teal-850 accent-teal-700 rounded border-slate-350 cursor-pointer"
                  />
                  <label htmlFor="consent-check" className="ml-3 text-xs text-slate-500 leading-relaxed cursor-pointer font-medium">
                    I consent to having my baseline data calculated for financial gaps and agree to receiving my PDF assessment report via email.
                  </label>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white py-4 rounded-xl font-bold text-md hover:shadow-lg transition shadow-md shadow-teal-900/10 mt-4 cursor-pointer"
                >
                  Generate My Scorecard
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Gated Full Dashboard Section (Initially Hidden) */}
        <section 
          id="full-dashboard" 
          className={`py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 ${isLocked ? "hidden" : ""}`}
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 border-b border-slate-250 pb-8 gap-6">
            <div>
              <div className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 text-xs font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                <Unlock className="w-3 h-3" /> Fully Unlocked
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">Your Financial Scorecard</h2>
              <p className="text-slate-500 mt-2 text-md">Live analysis covering 5 core pillars of security and asset accumulation.</p>
            </div>
            
            <div className="bg-cyan-50 border border-cyan-200/80 p-4 rounded-2xl flex items-center lg:min-w-[320px]">
              <div className="w-12 h-12 bg-cyan-150 rounded-xl flex items-center justify-center text-2xl mr-4 shadow-inner">
                🌱
              </div>
              <div>
                <p className="text-[10px] text-cyan-600 font-extrabold uppercase tracking-widest">Financial Persona</p>
                <p className="text-lg font-black text-cyan-950">The Growth Seeker</p>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex overflow-x-auto pb-4 gap-2 mb-8 scrollbar-none">
            <button 
              onClick={() => handleTabChange("tab-milestone")} 
              className={`px-6 py-3.5 rounded-full whitespace-nowrap text-sm font-bold transition cursor-pointer ${
                activeTab === "tab-milestone" 
                  ? "bg-teal-800 text-white shadow-lg shadow-teal-900/10" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Savings Growth
            </button>
            <button 
              onClick={() => handleTabChange("tab-retirement")} 
              className={`px-6 py-3.5 rounded-full whitespace-nowrap text-sm font-bold transition cursor-pointer ${
                activeTab === "tab-retirement" 
                  ? "bg-teal-800 text-white shadow-lg shadow-teal-900/10" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Retirement Readiness
            </button>
            <button 
              onClick={() => handleTabChange("tab-income")} 
              className={`px-6 py-3.5 rounded-full whitespace-nowrap text-sm font-bold transition cursor-pointer ${
                activeTab === "tab-income" 
                  ? "bg-teal-800 text-white shadow-lg shadow-teal-900/10" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Income Protection
            </button>
            <button 
              onClick={() => handleTabChange("tab-education")} 
              className={`px-6 py-3.5 rounded-full whitespace-nowrap text-sm font-bold transition cursor-pointer ${
                activeTab === "tab-education" 
                  ? "bg-teal-800 text-white shadow-lg shadow-teal-900/10" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Education Fund
            </button>
            <button 
              onClick={() => handleTabChange("tab-health")} 
              className={`px-6 py-3.5 rounded-full whitespace-nowrap text-sm font-bold transition cursor-pointer ${
                activeTab === "tab-health" 
                  ? "bg-teal-800 text-white shadow-lg shadow-teal-900/10" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Health Coverage
            </button>
          </div>

          {/* Tab contents */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10 min-h-[500px]">
            
            {/* Tab 1: Milestone Savings */}
            {activeTab === "tab-milestone" && (
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">Pillar 1</div>
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-slate-900">Wealth Accumulation</h3>
                  <p className="text-slate-600 mb-6 text-base leading-relaxed">
                    Based on your inputs, your savings trajectory shows solid capital pooling. At <strong>{expectedReturn.toFixed(1)}%</strong> interest over <strong>{years} years</strong>, you are set to build <strong>₱{projectedTotal.toLocaleString()}</strong>.
                  </p>
                  
                  <div className="p-5 bg-cyan-50/80 rounded-2xl border border-cyan-100 flex items-start">
                    <span className="text-2xl mr-4">💡</span>
                    <div>
                      <h4 className="font-bold text-cyan-950 text-sm">Advisor Insight</h4>
                      <p className="text-xs text-cyan-800 mt-1.5 leading-relaxed">
                        To lock in this return, consider allocating a portion of your cash reserves into tax-advantaged fixed income programs, securing compound yields against inflation.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center bg-slate-50 rounded-2xl border border-slate-200/60 p-8 text-center min-h-[300px]">
                  <TrendingUp className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-slate-500 font-semibold text-sm">Your interactive trajectory chart is running above.</p>
                  <button onClick={() => scrollToSection("calculator-section")} className="mt-2 text-teal-700 font-bold hover:underline text-sm cursor-pointer">
                    Adjust Sliders
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Retirement Readiness */}
            {activeTab === "tab-retirement" && (
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Left panel: Sliders */}
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Pillar 2 - Inputs</div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">Adjust Retirement Factors</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Current Client Age</span>
                        <span className="text-teal-700 font-extrabold">{clientAge} Years Old</span>
                      </div>
                      <input 
                        type="range" 
                        min="18" 
                        max="70" 
                        value={clientAge} 
                        onChange={(e) => setClientAge(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Target Retirement Age</span>
                        <span className="text-teal-700 font-extrabold">{retirementAge} Years Old</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="75" 
                        value={retirementAge} 
                        onChange={(e) => setRetirementAge(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Desired Monthly Expenses (Future Value base)</span>
                        <span className="text-teal-700 font-extrabold">₱{retExpenses.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="10000" 
                        max="300000" 
                        step="5000" 
                        value={retExpenses} 
                        onChange={(e) => setRetExpenses(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Expected SSS / GSIS Monthly Pension</span>
                        <span className="text-teal-700 font-extrabold">₱{retPension.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="50000" 
                        step="1000" 
                        value={retPension} 
                        onChange={(e) => setRetPension(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={saveAssessment} 
                    disabled={isSaving}
                    className="w-full bg-teal-800 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-teal-900 cursor-pointer disabled:opacity-50 transition"
                  >
                    {isSaving ? "Syncing..." : "Save Retirement Assessment"}
                  </button>
                </div>

                {/* Right panel: Output Gaps & Charts */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-extrabold text-slate-900 mb-2">Retirement Adequacy Options</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      Compare Living on Interest (capitalized at 6%) vs Sinking Fund (20-year depletion) against 4% inflation over the next {yearsToRetire} years.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-55 border border-slate-200 rounded-2xl p-4 space-y-2">
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1">Option 1: Capitalization</span>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-550">Target:</span>
                          <span className="font-bold text-slate-900">₱{Math.round(retirementTarget).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-100">
                          <span className="font-bold text-red-600">Gap:</span>
                          <span className="font-extrabold text-red-600">₱{Math.round(retirementGap).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="bg-slate-55 border border-slate-200 rounded-2xl p-4 space-y-2">
                        <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block mb-1">Option 2: Sinking Fund</span>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-550">Target:</span>
                          <span className="font-bold text-slate-900">₱{Math.round(retirementTargetSinking).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-100">
                          <span className="font-bold text-red-600">Gap:</span>
                          <span className="font-extrabold text-red-600">₱{Math.round(retirementGapSinking).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Comparison Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
                      <h5 className="font-extrabold text-slate-800 uppercase tracking-wider">Method Comparison</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/80">
                          <h6 className="font-extrabold text-teal-950 mb-1">1. Capitalization Method</h6>
                          <p className="text-[10px] text-teal-800 leading-relaxed">
                            <strong>Concept:</strong> Lives on interest, leaving principal intact.<br/>
                            <strong>Pro:</strong> Principal is never depleted; can be passed to heirs.<br/>
                            <strong>Con:</strong> Requires much higher starting capital.
                          </p>
                        </div>
                        <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100/80">
                          <h6 className="font-extrabold text-sky-950 mb-1">2. Sinking Fund Method</h6>
                          <p className="text-[10px] text-sky-800 leading-relaxed">
                            <strong>Concept:</strong> Depletes principal over a 20-year period.<br/>
                            <strong>Pro:</strong> Requires smaller starting fund.<br/>
                            <strong>Con:</strong> Risk of outliving the money if retirement exceeds 20 years.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-container w-full min-h-[250px] mt-6">
                    <canvas ref={retirementChartRef} id="retirementChart"></canvas>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Income Protection */}
            {activeTab === "tab-income" && (
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Left panel: Sliders */}
                <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Pillar 3 - Inputs</div>
                  <h3 className="text-xl font-bold text-slate-900">Adjust Protection Factors</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Marital Status</label>
                        <select 
                          value={maritalStatus} 
                          onChange={(e) => setMaritalStatus(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700 font-bold text-slate-700 cursor-pointer"
                        >
                          <option value="SINGLE">Single</option>
                          <option value="MARRIED">Married</option>
                          <option value="DIVORCED">Divorced</option>
                          <option value="WIDOWED">Widowed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Dependents Count</label>
                        <input 
                          type="number" 
                          min="0"
                          max="15"
                          value={dependentsCount} 
                          onChange={(e) => setDependentsCount(Math.max(0, Number(e.target.value)))} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700 font-bold text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Monthly Income Range</label>
                      <select 
                        value={monthlyIncomeRange} 
                        onChange={(e) => setMonthlyIncomeRange(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700 font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="Under ₱30,000">Under ₱30,000</option>
                        <option value="₱30,000 - ₱50,000">₱30,000 - ₱50,000</option>
                        <option value="₱50,000 - ₱100,000">₱50,000 - ₱100,000</option>
                        <option value="₱100,000+">₱100,000+</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Family Monthly Expenses</span>
                        <span className="text-teal-700 font-extrabold">₱{protExpenses.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="10000" 
                        max="300000" 
                        step="5000" 
                        value={protExpenses} 
                        onChange={(e) => setProtExpenses(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Outstanding Liabilities (Debts/Loans)</span>
                        <span className="text-teal-700 font-extrabold">₱{protLiabilities.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="5000000" 
                        step="50000" 
                        value={protLiabilities} 
                        onChange={(e) => setProtLiabilities(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Emergency Fund Buffer</span>
                        <span className="text-teal-700 font-extrabold">₱{protEmergency.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1000000" 
                        step="25000" 
                        value={protEmergency} 
                        onChange={(e) => setProtEmergency(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Existing Life Insurance Coverage</span>
                        <span className="text-teal-700 font-extrabold">₱{protExisting.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10000000" 
                        step="100000" 
                        value={protExisting} 
                        onChange={(e) => setProtExisting(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={saveAssessment} 
                    disabled={isSaving}
                    className="w-full bg-teal-800 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-teal-900 cursor-pointer disabled:opacity-50 transition"
                  >
                    {isSaving ? "Syncing..." : "Save Income Protection"}
                  </button>
                </div>

                {/* Right panel: Output Gaps & Charts */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-extrabold text-slate-900 mb-2">Family Income Protection</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      Binds capitalization of living costs (6% rate) and settling of active personal debts, minus coverage.
                    </p>

                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-5 space-y-3.5 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Capitalized replacement income:</span>
                        <span className="font-bold text-slate-900">₱{Math.round(amountNeededToProvide).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Total Liabilities + Buffers:</span>
                        <span className="font-bold text-slate-900">₱{totalLiabilities.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Available Cash + Coverages:</span>
                        <span className="font-bold text-slate-900">₱{totalCashAssets.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-2.5 border-t border-slate-100">
                        <span className="font-bold text-red-600">Identified Coverage Gap:</span>
                        <span className="font-extrabold text-red-600">₱{Math.round(incomeGap).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="chart-container w-full min-h-[250px] mt-auto">
                    <canvas ref={incomeChartRef} id="incomeChart"></canvas>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Education Fund */}
            {activeTab === "tab-education" && (
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Left panel: Sliders */}
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Pillar 4 - Inputs</div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">Adjust Education Factors</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Child's First Name</label>
                      <input 
                        type="text" 
                        value={childName} 
                        onChange={(e) => setChildName(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 font-bold"
                        placeholder="Enter child's name"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Child's Current Age</span>
                        <span className="text-teal-700 font-extrabold">{childAge} Years Old</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="17" 
                        value={childAge} 
                        onChange={(e) => setChildAge(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Chosen University Annual Tuition (Current Rate)</span>
                        <span className="text-teal-700 font-extrabold">₱{annualTuition.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="20000" 
                        max="500000" 
                        step="10000" 
                        value={annualTuition} 
                        onChange={(e) => setAnnualTuition(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={saveAssessment} 
                    disabled={isSaving}
                    className="w-full bg-teal-800 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-teal-900 cursor-pointer disabled:opacity-50 transition"
                  >
                    {isSaving ? "Syncing..." : "Save Education Assessment"}
                  </button>
                </div>

                {/* Right panel: Output Gaps & Charts */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-extrabold text-slate-900 mb-2">Education Funding for <span className="text-teal-700">{childName}</span></h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      Higher education tuition rates inflate at 8% annually. Your child will enter college in {yearsToCollege} years.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">4-Year Program</span>
                        <div className="flex justify-between text-xs">
                          <span>Target Need:</span>
                          <span className="font-bold text-slate-900">₱{Math.round(educationTarget4).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-slate-100">
                          <span className="font-bold text-red-600">Shortfall:</span>
                          <span className="font-bold text-red-600">₱{Math.round(educationGap4).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 space-y-2">
                        <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">5-Year Program</span>
                        <div className="flex justify-between text-xs">
                          <span>Target Need:</span>
                          <span className="font-bold text-slate-950">₱{Math.round(educationTarget5).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-teal-100">
                          <span className="font-bold text-red-600">Shortfall:</span>
                          <span className="font-bold text-red-600">₱{Math.round(educationGap5).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-container w-full min-h-[300px] mt-auto">
                    <canvas ref={educationChartRef} id="educationChart"></canvas>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Health Coverage */}
            {activeTab === "tab-health" && (
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Left panel: Sliders */}
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Pillar 5 - Inputs</div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">Adjust Medical Buffers</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Desired Health Coverage (HIB, CIB, ADB)</span>
                        <span className="text-teal-700 font-extrabold">₱{desiredHealth.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="500000" 
                        max="10000000" 
                        step="100000" 
                        value={desiredHealth} 
                        onChange={(e) => setDesiredHealth(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Existing Critical Illness / Hospital Coverage</span>
                        <span className="text-teal-700 font-extrabold">₱{existingHealth.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="5000000" 
                        step="50000" 
                        value={existingHealth} 
                        onChange={(e) => setExistingHealth(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={saveAssessment} 
                    disabled={isSaving}
                    className="w-full bg-teal-800 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-teal-900 cursor-pointer disabled:opacity-50 transition"
                  >
                    {isSaving ? "Syncing..." : "Save Health Assessment"}
                  </button>
                </div>

                {/* Right panel: Output Gaps & Charts */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-extrabold text-slate-900 mb-2">Health & Critical Illness</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      Recommended minimal safety net of ₱2.0M pesos to hedge against severe critical illness and rising hospitalization bills.
                    </p>

                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-5 space-y-3.5 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Desired Health Budget:</span>
                        <span className="font-bold text-slate-900">₱{desiredHealth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Existing Policy Reserves:</span>
                        <span className="font-bold text-slate-900">₱{existingHealth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-2.5 border-t border-slate-100">
                        <span className="font-bold text-red-600">Calculated Vulnerability Gap:</span>
                        <span className="font-extrabold text-red-600">₱{healthGap.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="chart-container w-full min-h-[300px] mt-auto">
                    <canvas ref={healthChartRef} id="healthChart"></canvas>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Generate PDF summary Callout */}
          <div className="mt-16 bg-gradient-to-br from-teal-950 via-teal-900 to-teal-850 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl font-extrabold mb-4">Download Your Custom Summary Report</h3>
              <p className="text-teal-200/90 mb-8 text-base font-medium">
                Generate a clean, professional PDF document summarizing your calculations, gap scorecards, and custom asset allocations.
              </p>
              <button 
                onClick={handlePdfDownload}
                disabled={isPdfGenerating}
                className="bg-white text-teal-950 hover:bg-slate-50 px-10 py-4 rounded-xl font-bold text-md transition shadow-xl w-full md:w-auto flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
              >
                {isPdfGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating report...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-teal-700" />
                    Download PDF Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Advisor Details Section */}
        <section id="about" className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12 bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-40 h-40 bg-teal-100 rounded-full overflow-hidden shadow-xl shrink-0 flex items-center justify-center border-4 border-white">
                <svg className="w-20 h-20 text-teal-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meet Your Licensed Advisor</h3>
                <p className="text-teal-700 font-bold mb-4 uppercase tracking-wider text-xs">Sun Life Financial Representative</p>
                <p className="text-slate-650 leading-relaxed mb-6 text-sm font-medium">
                  Helping clients establish financial peace since 2016. I specialize in identifying insurance protection gaps, setting retirement goals, and compiling clear, math-driven assessments.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => triggerToast("External Link", "Advisor LinkedIn Profile simulated.")} 
                    className="text-teal-800 font-bold hover:text-teal-950 transition flex items-center gap-1.5 text-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-teal-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn Profile
                  </button>
                  <button 
                    onClick={() => triggerToast("External Link", "Meeting scheduler simulated.")} 
                    className="text-teal-800 font-bold hover:text-teal-950 transition flex items-center gap-1.5 text-sm cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-teal-700" />
                    Schedule a consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <div className="mb-4 md:mb-0 flex items-center">
            <div className="w-6 h-6 bg-teal-850 rounded mr-2 flex items-center justify-center text-white font-black text-xs shadow-inner">F</div>
            <span>&copy; 2026 FreyaFNA. All Rights Reserved.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Disclaimer Details</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-[10px] text-slate-600 text-center md:text-left leading-relaxed">
          The computations provided by this platform are for educational and diagnostic planning purposes only and do not constitute formal legal, investment, or insurance contracts. Returns are calculated using simplified Time Value of Money (TVM) formulas and are not guarantees of future market behavior.
        </div>
      </footer>

      {/* Global Toast System */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 z-[110] flex items-center border-l-4 border-teal-500 max-w-sm animate-bounce">
          <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center mr-3 shrink-0">
            <Check className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-slate-100">{toast.title}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}
