import { NextResponse } from "next/server";
import { getLoanDetailById, loansListData } from "../data";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detail = getLoanDetailById(id);

  if (!detail) {
    return NextResponse.json({ message: "Loan not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const index = loansListData.findIndex((item) => item.id === id);

  if (index < 0) {
    return NextResponse.json({ message: "Loan not found" }, { status: 404 });
  }

  loansListData[index] = {
    ...loansListData[index],
    ...(body.status ? { status: body.status } : {}),
  };

  const updated = getLoanDetailById(id);
  return NextResponse.json(updated);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}
