import { NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/env";
export function GET(){try{getPublicEnv();return NextResponse.json({status:"ok"});}catch{return NextResponse.json({status:"unavailable"},{status:503});}}
