import { NextResponse } from "next/server";
import { loginConfigurado } from "@/lib/ambiente";
import { supabaseServidor } from "@/lib/supabase/servidor";

export async function POST(req: Request) {
  if (loginConfigurado()) await (await supabaseServidor()).auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
