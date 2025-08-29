import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function DELETE() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = user.id

    // Best-effort cleanup of profile rows. Using service role bypasses RLS.
    // Adjust table names if your schema differs.
    const dbErrors: any[] = []

    // Delete from public.users (profile table used in app)
    const { error: usersDelErr } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId)
    if (usersDelErr) dbErrors.push({ table: "users", error: usersDelErr.message })

    // Delete from public.profiles if it exists in your schema
    const { error: profilesDelErr } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId)
    if (profilesDelErr && !profilesDelErr.message?.includes("relation \"profiles\" does not exist")) {
      dbErrors.push({ table: "profiles", error: profilesDelErr.message })
    }

    // Finally, delete the auth user
    const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteAuthErr) {
      return NextResponse.json({ error: deleteAuthErr.message, details: dbErrors }, { status: 500 })
    }

    // Clear the user's session cookie
    await supabase.auth.signOut()

    return NextResponse.json({ success: true, dbErrors })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
