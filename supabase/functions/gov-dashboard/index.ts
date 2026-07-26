import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type DashboardSection =
  | "all"
  | "kpis"
  | "reports_by_lga"
  | "reports_by_type"
  | "reports_timeline"
  | "recycling_metrics"
  | "recycling_by_material"
  | "officer_performance"
  | "map_reports"
  | "monthly_summary"
  | "top_citizens"
  | "lgas";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authorization - only government/admin users can access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["government", "admin"].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Government or Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const url = new URL(req.url);
    const section = (url.searchParams.get("section") || "all") as DashboardSection;
    const lgaFilter = url.searchParams.get("lga");

    let responseData: Record<string, unknown> = {};

    // Route to appropriate data fetch
    if (section === "all") {
      // Get complete dashboard data via the aggregated function
      const { data: dashboardData, error: dashError } = await supabase
        .rpc("get_gov_dashboard_data");

      if (dashError) {
        console.error("Dashboard data error:", dashError);
        throw dashError;
      }

      responseData = dashboardData as Record<string, unknown>;
    } else if (section === "lgas") {
      const { data: lgas, error: lgaError } = await supabase
        .rpc("get_kogi_lgas");

      if (lgaError) throw lgaError;
      responseData = { lgas };
    } else if (section === "kpis") {
      const { data: kpis, error: kpiError } = await supabase
        .from("gov_executive_kpis")
        .select("*")
        .single();

      if (kpiError) throw kpiError;
      responseData = { kpis };
    } else if (section === "reports_by_lga") {
      let query = supabase.from("gov_reports_by_lga").select("*");
      if (lgaFilter) {
        query = query.eq("lga", lgaFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      responseData = { reports_by_lga: data };
    } else if (section === "reports_by_type") {
      const { data, error } = await supabase
        .from("gov_reports_by_type")
        .select("*");
      if (error) throw error;
      responseData = { reports_by_type: data };
    } else if (section === "reports_timeline") {
      const { data, error } = await supabase
        .from("gov_reports_timeline")
        .select("*")
        .order("report_date", { ascending: true });
      if (error) throw error;
      responseData = { reports_timeline: data };
    } else if (section === "recycling_metrics") {
      const { data, error } = await supabase
        .from("gov_recycling_metrics")
        .select("*")
        .order("transaction_date", { ascending: true });
      if (error) throw error;
      responseData = { recycling_metrics: data };
    } else if (section === "recycling_by_material") {
      const { data, error } = await supabase
        .from("gov_recycling_by_material")
        .select("*");
      if (error) throw error;
      responseData = { recycling_by_material: data };
    } else if (section === "officer_performance") {
      const { data, error } = await supabase
        .from("gov_officer_performance")
        .select("*");
      if (error) throw error;
      responseData = { officer_performance: data };
    } else if (section === "map_reports") {
      let query = supabase
        .from("gov_map_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (lgaFilter) {
        query = query.eq("lga", lgaFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      responseData = { map_reports: data };
    } else if (section === "monthly_summary") {
      const { data, error } = await supabase
        .from("gov_monthly_summary")
        .select("*")
        .order("month", { ascending: false });
      if (error) throw error;
      responseData = { monthly_summary: data };
    } else if (section === "top_citizens") {
      const { data, error } = await supabase
        .from("gov_citizen_engagement")
        .select("*")
        .limit(50);
      if (error) throw error;
      responseData = { top_citizens: data };
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown section: ${section}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (error) {
    console.error("Gov Dashboard Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
