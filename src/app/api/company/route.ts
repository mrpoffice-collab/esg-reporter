import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Get company and stats
export async function GET() {
  try {
    const company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json({ company: null });
    }

    // Get totals
    const emissionsSum = await prisma.emission.aggregate({
      where: { companyId: company.id },
      _sum: { amount: true },
    });

    const waterSum = await prisma.waterUsage.aggregate({
      where: { companyId: company.id },
      _sum: { amount: true },
    });

    const wasteSum = await prisma.wasteData.aggregate({
      where: { companyId: company.id },
      _sum: { amount: true },
    });

    // Get recent entries
    const recentEmissions = await prisma.emission.findMany({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
      take: 10,
    });

    const recentWater = await prisma.waterUsage.findMany({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
      take: 10,
    });

    const recentWaste = await prisma.wasteData.findMany({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
      take: 10,
    });

    return NextResponse.json({
      company,
      stats: {
        totalEmissions: emissionsSum._sum.amount || 0,
        totalWater: waterSum._sum.amount || 0,
        totalWaste: wasteSum._sum.amount || 0,
        recentEmissions,
        recentWater,
        recentWaste,
      },
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

// POST - Create company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, industry } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        industry: industry || null,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
