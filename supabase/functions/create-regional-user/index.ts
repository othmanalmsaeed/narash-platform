import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { full_name, email, password, school_id, role } = body;

    if (!full_name || !email || !password || !school_id || !role) {
      return new Response(JSON.stringify({ error: "جميع الحقول مطلوبة" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;

    // 2. Update profile with school_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ full_name, school_id })
      .eq("id", userId);
    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // 3. Assign role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (roleError) {
      console.error("Role insert error:", roleError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
