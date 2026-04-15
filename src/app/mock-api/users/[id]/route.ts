import { NextResponse } from "next/server";
import data from "../data";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = data.find((u) => u.id === params.id);

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const user = data.find((entry) => entry.id === params.id);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const nextUser = {
    ...user,
    ...body,
  };

  const index = data.findIndex((entry) => entry.id === params.id);
  if (index >= 0) {
    data[index] = nextUser;
  }

  return NextResponse.json(nextUser);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  return PATCH(req, { params });
}
