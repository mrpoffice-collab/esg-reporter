// ESG Reporter Types

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Emission {
  id: string;
  companyId: string;
  date: Date;
  category: string;
  amount: number;
  description: string | null;
  createdAt: Date;
}

export interface WaterUsage {
  id: string;
  companyId: string;
  date: Date;
  category: string;
  amount: number;
  description: string | null;
  createdAt: Date;
}

export interface WasteData {
  id: string;
  companyId: string;
  date: Date;
  category: string;
  amount: number;
  description: string | null;
  createdAt: Date;
}

export interface Report {
  id: string;
  companyId: string;
  period: string;
  type: string;
  totalEmissions: number | null;
  totalWater: number | null;
  totalWaste: number | null;
  createdAt: Date;
}

// Form data types
export interface EmissionFormData {
  category: string;
  amount: number;
  description?: string;
  date?: string;
}

export interface WaterFormData {
  category: string;
  amount: number;
  description?: string;
  date?: string;
}

export interface WasteFormData {
  category: string;
  amount: number;
  description?: string;
  date?: string;
}

// Categories
export const EMISSION_CATEGORIES = [
  "electricity",
  "fuel",
  "travel",
  "shipping",
  "other",
];

export const WATER_CATEGORIES = [
  "operations",
  "facilities",
  "irrigation",
  "other",
];

export const WASTE_CATEGORIES = [
  "landfill",
  "recycled",
  "composted",
  "hazardous",
  "other",
];

export const INDUSTRIES = [
  "Manufacturing",
  "Retail",
  "Technology",
  "Healthcare",
  "Food & Beverage",
  "Construction",
  "Transportation",
  "Agriculture",
  "Other",
];
