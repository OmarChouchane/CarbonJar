import { NextResponse, type NextRequest } from "next/server";

// Minimal stub to make this route a valid module. Replace with real logic as needed.
export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { ok: true, message: "auth-users endpoint not implemented yet" },
    { status: 200 }
  );
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: "Not implemented" },
    { status: 501 }
  );
}

export async function PUT(_req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: "Not implemented" },
    { status: 501 }
  );
}

export async function DELETE(_req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: "Not implemented" },
    { status: 501 }
  );
}
