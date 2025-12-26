import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST - Add emission entry
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

    const emission = await prisma.emission.create({
      data: {
        companyId: company.id,
        category,
        amount: parseFloat(amount),
        description: description || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(emission);
  } catch (error) {
    console.error("Error creating emission:", error);
    return NextResponse.json({ error: "Failed to create emission" }, { status: 500 });
  }
}

// GET - List emissions
export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const emissions = await prisma.emission.findMany({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(emissions);
  } catch (error) {
    console.error("Error fetching emissions:", error);
    return NextResponse.json({ error: "Failed to fetch emissions" }, { status: 500 });
  }
}
