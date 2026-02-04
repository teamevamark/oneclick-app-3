import { Settings } from "lucide-react";
import elifeLogo from "@/assets/elife-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Subtle background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/5 rounded-full blur-3xl pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Logo */}
        <div className="float-animation mb-8">
          <img 
            src={elifeLogo} 
            alt="e-life one-click" 
            className="w-72 md:w-96 lg:w-[480px] h-auto drop-shadow-lg"
          />
        </div>

        {/* Welcome text */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
          Welcome to <span className="gradient-text font-bold">e-life one-click</span>
        </h1>

        {/* Maintenance badge */}
        <div className="flex items-center gap-3 mt-6 px-6 py-3 bg-muted rounded-full border border-border shadow-sm">
          <Settings className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-muted-foreground font-medium">
            Under Maintenance
          </span>
        </div>

        <p className="mt-6 text-muted-foreground max-w-md">
          We're working hard to bring you something amazing. Please check back soon!
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-sm text-muted-foreground">
        © 2026 e-life one-click. All rights reserved.
      </div>
    </div>
  );
};

export default Index;
