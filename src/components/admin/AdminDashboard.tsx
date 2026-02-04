import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Building2,
  Globe,
  Smartphone,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CompanyForm } from "./CompanyForm";
import { LinkForm } from "./LinkForm";
import { AppForm } from "./AppForm";
import type { Company, WebsiteLink, App } from "@/types/database";
import elifeLogo from "@/assets/elife-logo.png";

export function AdminDashboard() {
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [appFormOpen, setAppFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [editingLink, setEditingLink] = useState<WebsiteLink | undefined>();
  const [editingApp, setEditingApp] = useState<App | undefined>();
  
  const { signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all companies (including inactive for admin)
  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Company[];
    },
  });

  const { data: links = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["admin-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WebsiteLink[];
    },
  });

  const { data: apps = [], isLoading: loadingApps } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as App[];
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    queryClient.invalidateQueries({ queryKey: ["admin-links"] });
    queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  };

  const handleDelete = async (type: "company" | "link" | "app", id: string) => {
    try {
      const table = type === "company" ? "companies" : type === "link" ? "website_links" : "apps";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted` });
      refreshData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <img src={elifeLogo} alt="e-life" className="h-8 w-auto" />
            <span className="font-semibold">Admin Panel</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8">
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Companies</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Apps</span>
            </TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Companies</CardTitle>
                <Button size="sm" onClick={() => { setEditingCompany(undefined); setCompanyFormOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </CardHeader>
              <CardContent>
                {loadingCompanies ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : companies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No companies yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>
                            {company.logo_url ? (
                              <img src={company.logo_url} alt="" className="w-10 h-10 rounded object-contain" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>
                            <Badge variant={company.is_active ? "default" : "secondary"}>
                              {company.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingCompany(company); setCompanyFormOpen(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Company?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will also delete all associated links and apps.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete("company", company.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Website Links</CardTitle>
                <Button size="sm" onClick={() => { setEditingLink(undefined); setLinkFormOpen(true); }} disabled={companies.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </CardHeader>
              <CardContent>
                {loadingLinks ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : links.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No links yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {links.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell>{getCompanyName(link.company_id)}</TableCell>
                          <TableCell className="font-medium">{link.title}</TableCell>
                          <TableCell>
                            <Badge variant={link.type === "website" ? "default" : "outline"}>
                              {link.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingLink(link); setLinkFormOpen(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Link?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete("link", link.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Android Apps</CardTitle>
                <Button size="sm" onClick={() => { setEditingApp(undefined); setAppFormOpen(true); }} disabled={companies.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add App
                </Button>
              </CardHeader>
              <CardContent>
                {loadingApps ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : apps.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No apps yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>App Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apps.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>{getCompanyName(app.company_id)}</TableCell>
                          <TableCell className="font-medium">{app.app_name}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingApp(app); setAppFormOpen(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete App?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete("app", app.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Forms */}
      <CompanyForm
        company={editingCompany}
        open={companyFormOpen}
        onClose={() => setCompanyFormOpen(false)}
        onSuccess={refreshData}
      />
      <LinkForm
        link={editingLink}
        companies={companies}
        open={linkFormOpen}
        onClose={() => setLinkFormOpen(false)}
        onSuccess={refreshData}
      />
      <AppForm
        app={editingApp}
        companies={companies}
        open={appFormOpen}
        onClose={() => setAppFormOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
