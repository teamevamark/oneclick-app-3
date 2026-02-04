import { Loader2, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { CompanyCard } from "@/components/CompanyCard";
import { useCompanies } from "@/hooks/useCompanies";

export default function Home() {
  const { data: companies, isLoading, error } = useCompanies();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-elife-cyan/5">
      <Header />
      
      <main className="flex-1 container px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">
            e-life oneclick-app
          </h1>
          <p className="text-lg text-muted-foreground">
            Access all company websites and apps in one place
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-destructive">
            Failed to load companies. Please try again.
          </div>
        )}

        {!isLoading && !error && companies?.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-medium mb-2">No Companies Yet</h2>
            <p className="text-muted-foreground">
              Companies will appear here once added by an admin.
            </p>
          </div>
        )}

        {companies && companies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 e-life oneclick-app. All rights reserved.
      </footer>
    </div>
  );
}
