import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST - Add waste entry
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

    const waste = await prisma.wasteData.create({
      data: {
        companyId: company.id,
        category,
        amount: parseFloat(amount),
        description: description || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(waste);
  } catch (error) {
    console.error("Error creating waste entry:", error);
    return NextResponse.json({ error: "Failed to create waste entry" }, { status: 500 });
  }
}

// GET - List waste entries
export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const waste = await prisma.wasteData.findMany({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(waste);
  } catch (error) {
    console.error("Error fetching waste entries:", error);
    return NextResponse.json({ error: "Failed to fetch waste entries" }, { status: 500 });
  }
}
