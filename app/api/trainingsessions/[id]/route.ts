import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Update training session
  return NextResponse.json({ message: `Update training session ${params.id}` });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Delete training session
  return NextResponse.json({ message: `Delete training session ${params.id}` });
}
