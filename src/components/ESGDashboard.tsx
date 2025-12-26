"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Leaf,
  Droplets,
  Trash2,
  FileText,
  Plus,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import {
  EMISSION_CATEGORIES,
  WATER_CATEGORIES,
  WASTE_CATEGORIES,
  INDUSTRIES,
} from "@/types";

interface Company {
  id: string;
  name: string;
  industry: string | null;
}

interface MetricEntry {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string | null;
}

interface Stats {
  totalEmissions: number;
  totalWater: number;
  totalWaste: number;
  recentEmissions: MetricEntry[];
  recentWater: MetricEntry[];
  recentWaste: MetricEntry[];
}

interface ESGDashboardProps {
  initialCompany: Company | null;
  initialStats: Stats | null;
}

export function ESGDashboard({ initialCompany, initialStats }: ESGDashboardProps) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(initialCompany);
  const [stats, setStats] = useState<Stats | null>(initialStats);
  const [activeTab, setActiveTab] = useState<"dashboard" | "emissions" | "water" | "waste">("dashboard");

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  async function handleSetupCompany(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: companyName, industry: companyIndustry }),
    });
    if (res.ok) {
      router.refresh();
    }
    setSaving(false);
  }

  async function handleAddEntry(type: "emissions" | "water" | "waste") {
    if (!formCategory || !formAmount) return;
    setSaving(true);

    const res = await fetch(`/api/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: formCategory,
        amount: parseFloat(formAmount),
        description: formDescription || null,
        date: formDate,
      }),
    });
    if (res.ok) {
      setFormCategory("");
      setFormAmount("");
      setFormDescription("");
      router.refresh();
    }
    setSaving(false);
  }

  async function handleGenerateReport() {
    const res = await fetch("/api/reports", { method: "POST" });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `esg-report-${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
    }
  }

  // Show setup form if no company
  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-600 rounded-lg">
              <Leaf size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ESG Reporter</h1>
          </div>
          <p className="text-gray-700 mb-6">
            Set up your company to start tracking sustainability metrics.
          </p>
          <form onSubmit={handleSetupCompany} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your Company Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                value={companyIndustry}
                onChange={(e) => setCompanyIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {saving ? "Setting up..." : "Get Started"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const categories =
    activeTab === "emissions"
      ? EMISSION_CATEGORIES
      : activeTab === "water"
      ? WATER_CATEGORIES
      : WASTE_CATEGORIES;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Leaf size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ESG Reporter</h1>
              <p className="text-sm text-gray-600">{company.name}</p>
            </div>
          </div>
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FileText size={18} />
            Generate Report
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <div className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "dashboard"
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart3 size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("emissions")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "emissions"
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <TrendingDown size={20} />
              Carbon Emissions
            </button>
            <button
              onClick={() => setActiveTab("water")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "water"
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Droplets size={20} />
              Water Usage
            </button>
            <button
              onClick={() => setActiveTab("waste")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "waste"
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Trash2 size={20} />
              Waste Metrics
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && stats && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <TrendingDown size={20} className="text-amber-700" />
                    </div>
                    <h3 className="font-medium text-gray-900">Carbon Emissions</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalEmissions.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">kg CO2e total</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Droplets size={20} className="text-blue-700" />
                    </div>
                    <h3 className="font-medium text-gray-900">Water Usage</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalWater.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">liters total</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Trash2 size={20} className="text-green-700" />
                    </div>
                    <h3 className="font-medium text-gray-900">Waste</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalWaste.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">kg total</p>
                </div>
              </div>

              {/* Recent Entries */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Recent Emissions</h3>
                  {stats.recentEmissions.length === 0 ? (
                    <p className="text-gray-600 text-sm">No entries yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {stats.recentEmissions.slice(0, 5).map((e) => (
                        <li key={e.id} className="text-sm text-gray-700">
                          {e.category}: {e.amount} kg CO2e
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Recent Water</h3>
                  {stats.recentWater.length === 0 ? (
                    <p className="text-gray-600 text-sm">No entries yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {stats.recentWater.slice(0, 5).map((e) => (
                        <li key={e.id} className="text-sm text-gray-700">
                          {e.category}: {e.amount} L
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Recent Waste</h3>
                  {stats.recentWaste.length === 0 ? (
                    <p className="text-gray-600 text-sm">No entries yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {stats.recentWaste.slice(0, 5).map((e) => (
                        <li key={e.id} className="text-sm text-gray-700">
                          {e.category}: {e.amount} kg
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {(activeTab === "emissions" || activeTab === "water" || activeTab === "waste") && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === "emissions" ? "Carbon Emissions" : activeTab}
              </h2>

              {/* Add Entry Form */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Plus size={18} />
                  Add Entry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount ({activeTab === "emissions" ? "kg CO2e" : activeTab === "water" ? "liters" : "kg"})
                    </label>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleAddEntry(activeTab as "emissions" | "water" | "waste")}
                  disabled={saving}
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Entry"}
                </button>
              </div>

              {/* Entries List */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Recent Entries</h3>
                {stats && (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Date</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Category</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Amount</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === "emissions"
                        ? stats.recentEmissions
                        : activeTab === "water"
                        ? stats.recentWater
                        : stats.recentWaste
                      ).map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-100">
                          <td className="py-2 text-sm text-gray-900">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 text-sm text-gray-900 capitalize">{entry.category}</td>
                          <td className="py-2 text-sm text-gray-900">
                            {entry.amount}{" "}
                            {activeTab === "emissions" ? "kg CO2e" : activeTab === "water" ? "L" : "kg"}
                          </td>
                          <td className="py-2 text-sm text-gray-600">{entry.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
