import { NextRequest, NextResponse } from "next/server"
import { confirmUser } from "@/lib/mailer"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) 
    return NextResponse.json({ success: false, message: "Token manquant" }, { status: 400 })

  const result = await confirmUser(token)

  if (result.success) {
    return NextResponse.json({ success: true, message: result.message }, { status: 200 })
  } else {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 })
  }
}

export {}
