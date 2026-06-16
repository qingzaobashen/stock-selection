import { supabase } from "@/lib/supabase";
import type { Industry } from "@/lib/types";
import { IndustriesContent } from "./IndustriesContent";

export const revalidate = 3600;

async function getIndustries() {
  const { data } = await supabase
    .from("industries")
    .select("*")
    .eq("level", 1)
    .order("name");

  return (data ?? []) as Industry[];
}

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return <IndustriesContent industries={industries} />;
}
