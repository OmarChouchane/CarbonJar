import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Get question details
  return NextResponse.json({ message: `Get question ${id}` });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Update question
  return NextResponse.json({ message: `Update question ${id}` });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Delete question
  return NextResponse.json({ message: `Delete question ${id}` });
}
