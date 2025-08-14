import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Get question details
  return NextResponse.json({ message: `Get question ${params.id}` });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Update question
  return NextResponse.json({ message: `Update question ${params.id}` });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Delete question
  return NextResponse.json({ message: `Delete question ${params.id}` });
}
