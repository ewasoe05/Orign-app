"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  BusinessWeekStats,
  FollowUpItem,
  GoogleReview,
  Lead,
  LeadStatus,
} from "@/lib/types";
import { COMMISSION_REVENUE_PER_1000 } from "@/lib/seed";
import { addDaysIso, daysBetween, formatLocalDate, getWeekStartDate } from "@/lib/utils";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidateBusiness() {
  revalidatePath("/");
  revalidatePath("/business");
  revalidatePath("/review");
}

export async function getLeads(): Promise<Lead[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("lead_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function getBusinessWeekStats(): Promise<BusinessWeekStats> {
  const { supabase, userId } = await getUserId();
  const weekStart = getWeekStartDate();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .gte("lead_date", weekStart);

  if (error) throw error;
  const leads = (data ?? []) as Lead[];
  const quoted = leads.reduce((sum, lead) => sum + Number(lead.quoted_amount), 0);
  const wonLeads = leads.filter((lead) => lead.status === "won");
  const won = wonLeads.reduce((sum, lead) => sum + Number(lead.quoted_amount), 0);

  return {
    leads: leads.length,
    closes: wonLeads.length,
    quoted,
    won,
    estimatedCommission: COMMISSION_REVENUE_PER_1000 > 0 ? (won / COMMISSION_REVENUE_PER_1000) * 1000 : 0,
  };
}

export async function getFollowUpQueue(): Promise<FollowUpItem[]> {
  const leads = await getLeads();
  const today = formatLocalDate();

  return leads
    .filter((lead) => lead.status === "open")
    .map((lead) => {
      const age = daysBetween(lead.lead_date, today);
      const followUpDay: 2 | 7 | 21 = age < 2 ? 2 : age < 7 ? 7 : 21;
      const dueDate = addDaysIso(lead.lead_date, followUpDay);
      const daysUntilDue = daysBetween(today, dueDate);
      return {
        lead,
        followUpDay,
        dueDate,
        daysUntilDue,
        overdue: daysUntilDue < 0,
      };
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue || a.followUpDay - b.followUpDay);
}

export async function logLead(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const leadDate = String(formData.get("lead_date"));
  const source = String(formData.get("source") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const quotedAmount = parseFloat(String(formData.get("quoted_amount") ?? "0"));
  const status = String(formData.get("status") ?? "open") as LeadStatus;
  const whyLost = String(formData.get("why_lost") ?? "") || null;

  if (!leadDate || !source || !service) {
    return { error: "Date, source, and service are required" };
  }
  if (isNaN(quotedAmount) || quotedAmount < 0) {
    return { error: "Enter a valid quoted amount" };
  }
  if (status !== "open" && status !== "won" && status !== "lost") {
    return { error: "Invalid status" };
  }
  if (status === "lost" && !whyLost) {
    return { error: "Say why the quote was lost" };
  }

  const { error } = await supabase.from("leads").insert({
    user_id: userId,
    lead_date: leadDate,
    source,
    service,
    quoted_amount: quotedAmount,
    status,
    why_lost: status === "lost" ? whyLost : null,
  });

  if (error) return { error: error.message };

  revalidateBusiness();
  return { success: true };
}

export async function updateLeadStatus(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const leadId = String(formData.get("lead_id"));
  const status = String(formData.get("status")) as LeadStatus;
  const whyLost = String(formData.get("why_lost") ?? "") || null;

  if (!leadId) return { error: "Lead not found" };
  if (status !== "open" && status !== "won" && status !== "lost") {
    return { error: "Invalid status" };
  }
  if (status === "lost" && !whyLost) {
    return { error: "Say why the quote was lost" };
  }

  const { error } = await supabase
    .from("leads")
    .update({
      status,
      why_lost: status === "lost" ? whyLost : null,
    })
    .eq("id", leadId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidateBusiness();
  return { success: true };
}

export async function getGoogleReviews(): Promise<GoogleReview[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("google_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("review_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GoogleReview[];
}

export async function getGoogleReviewCount(): Promise<number> {
  const { supabase, userId } = await getUserId();
  const { count, error } = await supabase
    .from("google_reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function logGoogleReview(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const reviewDate = String(formData.get("review_date") || formatLocalDate());
  const notes = String(formData.get("notes") ?? "") || null;

  const { error } = await supabase.from("google_reviews").insert({
    user_id: userId,
    review_date: reviewDate,
    notes,
  });

  if (error) return { error: error.message };

  revalidateBusiness();
  return { success: true };
}
