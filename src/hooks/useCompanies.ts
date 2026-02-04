import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Company, WebsiteLink, App, CompanyWithRelations } from "@/types/database";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async (): Promise<CompanyWithRelations[]> => {
      // Fetch companies
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (companiesError) throw companiesError;

      if (!companies || companies.length === 0) return [];

      // Fetch all website links
      const { data: links, error: linksError } = await supabase
        .from("website_links")
        .select("*");

      if (linksError) throw linksError;

      // Fetch all apps
      const { data: apps, error: appsError } = await supabase
        .from("apps")
        .select("*");

      if (appsError) throw appsError;

      // Combine data
      return companies.map((company) => ({
        ...company,
        website_links: (links || []).filter((l) => l.company_id === company.id) as WebsiteLink[],
        apps: (apps || []).filter((a) => a.company_id === company.id) as App[],
      }));
    },
  });
}
