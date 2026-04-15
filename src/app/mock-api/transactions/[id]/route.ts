import { NextResponse } from "next/server";
import { getTransactionDetailById, transactionsListData } from "../data";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detail = getTransactionDetailById(id);

  if (!detail) {
    return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const index = transactionsListData.findIndex((item) => item.id === id);

  if (index < 0) {
    return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
  }

  transactionsListData[index] = {
    ...transactionsListData[index],
    ...(body.status ? { status: body.status } : {}),
  };

  const updated = getTransactionDetailById(id);
  return NextResponse.json(updated);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}
