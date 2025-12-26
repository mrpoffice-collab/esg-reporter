import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST - Add water usage entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, amount, description, date } = body;

    // Get company
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!category || amount === undefined) {
      return NextResponse.json({ error: "Category and amount are required" }, { status: 400 });
    }

    const water = await prisma.waterUsage.create({
      data: {
        companyId: company.id,
        category,
        amount: parseFloat(amount),
        description: description || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(water);
  } catch (error) {
    console.error("Error creating water usage:", error);
    return NextResponse.json({ error: "Failed to create water usage" }, { status: 500 });
  }
}

// GET - List water usage
export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const water = await prisma.waterUsage.findMany({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(water);
  } catch (error) {
    console.error("Error fetching water usage:", error);
    return NextResponse.json({ error: "Failed to fetch water usage" }, { status: 500 });
  }
}
