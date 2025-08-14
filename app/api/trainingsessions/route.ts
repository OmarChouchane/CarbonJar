import { NextResponse } from "next/server";

export async function GET() {
  // List all training sessions
  return NextResponse.json({ message: "List training sessions" });
}

export async function POST(request: Request) {
  // Create training session
  const requestData = await request.json();
  return NextResponse.json({
    message: "Create training session",
    data: requestData,
  });
}
