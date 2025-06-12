import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

/*
 * Get all contact form categories
 * This is a public endpoint that doesn't require authentication
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Fetching contact form categories");
    const categories = await prisma.contactFormCategoryType.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    console.log("Contact form categories fetched", categories);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching contact form categories:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch contact form categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 