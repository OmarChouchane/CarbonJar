import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message: "Contact API is working!",
      timestamp: new Date().toISOString(),
      status: "success",
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json(
      {
        message: "Contact form received!",
        data: body,
        timestamp: new Date().toISOString(),
        status: "success",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        message: "Error processing request",
        error: "Invalid JSON",
        timestamp: new Date().toISOString(),
        status: "error",
      },
      { status: 400 }
    );
  }
}
