import { NextResponse } from "next/server";
import data  from "../data";

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