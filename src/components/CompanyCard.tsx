import { useState } from "react";
import { Globe, Settings, Download, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CompanyWithRelations } from "@/types/database";

interface CompanyCardProps {
  company: CompanyWithRelations;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const websiteLinks = company.website_links.filter((l) => l.type === "website");
  const adminLinks = company.website_links.filter((l) => l.type === "admin");
  const hasMore = websiteLinks.length > 1 || adminLinks.length > 0 || company.apps.length > 0;
  const primaryLink = websiteLinks[0];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              className="w-14 h-14 rounded-xl object-contain bg-muted p-1"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{company.name}</h3>
            <div className="flex gap-2 mt-1">
              {websiteLinks.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {websiteLinks.length} site{websiteLinks.length > 1 ? "s" : ""}
                </Badge>
              )}
              {company.apps.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {company.apps.length} app{company.apps.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Primary website link - always visible */}
        {primaryLink && (
          <Button
            variant="default"
            className="w-full justify-start gap-2"
            onClick={() => window.open(primaryLink.url, "_blank")}
          >
            <Globe className="w-4 h-4" />
            {primaryLink.title}
          </Button>
        )}

        {/* Show more content */}
        {hasMore && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-center gap-2 text-muted-foreground">
                {isOpen ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show more
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 mt-2">
              {/* Additional website links */}
              {websiteLinks.slice(1).map((link) => (
                <Button
                  key={link.id}
                  variant="secondary"
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  <Globe className="w-4 h-4" />
                  {link.title}
                </Button>
              ))}

              {/* Admin panel links */}
              {adminLinks.map((link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  <Settings className="w-4 h-4" />
                  {link.title}
                </Button>
              ))}

              {/* App downloads */}
              {company.apps.map((app) => (
                <Button
                  key={app.id}
                  variant="outline"
                  className="w-full justify-start gap-2 border-primary/50 text-primary hover:bg-primary/10"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = app.apk_file_url;
                    link.download = `${app.app_name}.apk`;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                  {app.app_name}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
