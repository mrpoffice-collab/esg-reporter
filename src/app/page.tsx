import prisma from "@/lib/db";
import { ESGDashboard } from "@/components/ESGDashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Server-side data fetching
  const company = await prisma.company.findFirst();

  let stats = null;
  if (company) {
    const [emissions, water, waste] = await Promise.all([
      prisma.emission.findMany({
        where: { companyId: company.id },
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.waterUsage.findMany({
        where: { companyId: company.id },
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.wasteData.findMany({
        where: { companyId: company.id },
        orderBy: { date: "desc" },
        take: 10,
      }),
    ]);

    const totalEmissions = emissions.reduce((sum, e) => sum + e.amount, 0);
    const totalWater = water.reduce((sum, w) => sum + w.amount, 0);
    const totalWaste = waste.reduce((sum, w) => sum + w.amount, 0);

    stats = {
      totalEmissions,
      totalWater,
      totalWaste,
      recentEmissions: emissions.map(e => ({
        id: e.id,
        date: e.date.toISOString(),
        category: e.category,
        amount: e.amount,
        description: e.description,
      })),
      recentWater: water.map(w => ({
        id: w.id,
        date: w.date.toISOString(),
        category: w.category,
        amount: w.amount,
        description: w.description,
      })),
      recentWaste: waste.map(w => ({
        id: w.id,
        date: w.date.toISOString(),
        category: w.category,
        amount: w.amount,
        description: w.description,
      })),
    };
  }

  const initialCompany = company ? {
    id: company.id,
    name: company.name,
    industry: company.industry,
  } : null;

  return <ESGDashboard initialCompany={initialCompany} initialStats={stats} />;
}
