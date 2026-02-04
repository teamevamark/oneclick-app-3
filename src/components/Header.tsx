import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import elifeLogo from "@/assets/elife-logo.png";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={elifeLogo} alt="e-life one-click" className="h-10 w-auto" />
          <span className="font-semibold text-lg hidden sm:inline gradient-text">
            Company Access Hub
          </span>
        </Link>
        
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
