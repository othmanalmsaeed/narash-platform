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

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();
    if (!roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "صلاحيات غير كافية" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { full_name, national_id, gender, phone, school_id, student_number, email, password } = body;

    // Validate required fields
    if (!full_name || !national_id || !gender || !school_id || !student_number || !email || !password) {
      return new Response(JSON.stringify({ error: "جميع الحقول مطلوبة" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate student_number format (2 letters + 5 digits)
    if (!/^[A-Z]{2}\d{5}$/.test(student_number)) {
      return new Response(JSON.stringify({ error: "رقم التسجيل يجب أن يبدأ بحرفين ثم 5 أرقام (مثال: AB12345)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate national_id format (10 digits)
    if (!/^\d{10}$/.test(national_id)) {
      return new Response(JSON.stringify({ error: "الرقم الوطني يجب أن يكون 10 أرقام" }), {
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

    // 2. Update profile (created by trigger) with phone and school_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ full_name, phone, school_id })
      .eq("id", userId);
    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // 3. Insert into students table
    const { error: studentError } = await supabaseAdmin
      .from("students")
      .insert({
        id: userId,
        school_id,
        student_number,
        national_id,
        gender,
      });
    if (studentError) {
      // Cleanup: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: studentError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Assign student role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "student" });
    if (roleError) {
      console.error("Role insert error:", roleError);
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
