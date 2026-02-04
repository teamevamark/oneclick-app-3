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

// Vibrant gradient combinations matching e-life logo colors
const cardGradients = [
  "from-elife-cyan/20 via-elife-blue/10 to-transparent",
  "from-elife-blue/20 via-elife-green/10 to-transparent",
  "from-elife-green/20 via-elife-yellow/10 to-transparent",
  "from-elife-yellow/20 via-elife-orange/10 to-transparent",
  "from-elife-orange/20 via-elife-pink/10 to-transparent",
  "from-elife-pink/20 via-elife-cyan/10 to-transparent",
];

const iconColors = [
  "text-elife-cyan",
  "text-elife-blue",
  "text-elife-green",
  "text-elife-yellow",
  "text-elife-orange",
  "text-elife-pink",
];

const borderColors = [
  "border-elife-cyan/30 hover:border-elife-cyan/60",
  "border-elife-blue/30 hover:border-elife-blue/60",
  "border-elife-green/30 hover:border-elife-green/60",
  "border-elife-yellow/30 hover:border-elife-yellow/60",
  "border-elife-orange/30 hover:border-elife-orange/60",
  "border-elife-pink/30 hover:border-elife-pink/60",
];

export function CompanyCard({ company }: CompanyCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate consistent color index based on company id
  const colorIndex = company.id.charCodeAt(0) % cardGradients.length;
  const gradient = cardGradients[colorIndex];
  const iconColor = iconColors[colorIndex];
  const borderColor = borderColors[colorIndex];
  
  const websiteLinks = company.website_links.filter((l) => l.type === "website");
  const adminLinks = company.website_links.filter((l) => l.type === "admin");
  const hasMore = websiteLinks.length > 1 || adminLinks.length > 0 || company.apps.length > 0;
  const primaryLink = websiteLinks[0];

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 ${borderColor} bg-gradient-to-br ${gradient}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          {company.logo_url ? (
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-md opacity-60`} />
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="relative w-16 h-16 rounded-xl object-contain bg-card p-2 shadow-lg border border-border/50"
              />
            </div>
          ) : (
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg border border-border/50`}>
              <Building2 className={`w-8 h-8 ${iconColor}`} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl truncate text-foreground">{company.name}</h3>
            <div className="flex gap-2 mt-2">
              {websiteLinks.length > 0 && (
                <Badge className="bg-elife-cyan/20 text-elife-cyan border-elife-cyan/30 hover:bg-elife-cyan/30">
                  {websiteLinks.length} site{websiteLinks.length > 1 ? "s" : ""}
                </Badge>
              )}
              {company.apps.length > 0 && (
                <Badge className="bg-elife-pink/20 text-elife-pink border-elife-pink/30 hover:bg-elife-pink/30">
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
            className="w-full justify-start gap-3 bg-gradient-to-r from-elife-cyan to-elife-blue text-white hover:from-elife-cyan/90 hover:to-elife-blue/90 shadow-lg shadow-elife-cyan/20"
            onClick={() => window.open(primaryLink.url, "_blank")}
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium">{primaryLink.title}</span>
          </Button>
        )}

        {/* Show more content */}
        {hasMore && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                {isOpen ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show more ({websiteLinks.length - 1 + adminLinks.length + company.apps.length})
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 mt-2">
              {/* Additional website links */}
              {websiteLinks.slice(1).map((link) => (
                <Button
                  key={link.id}
                  className="w-full justify-start gap-3 bg-gradient-to-r from-elife-blue/80 to-elife-green/80 text-white hover:from-elife-blue hover:to-elife-green"
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
                  className="w-full justify-start gap-3 border-elife-orange/50 text-elife-orange hover:bg-elife-orange/10 hover:border-elife-orange"
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
                  className="w-full justify-start gap-3 border-elife-pink/50 text-elife-pink hover:bg-elife-pink/10 hover:border-elife-pink"
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
