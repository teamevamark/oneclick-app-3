import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { App, Company } from "@/types/database";

const appSchema = z.object({
  company_id: z.string().min(1, "Select a company"),
  app_name: z.string().min(1, "App name is required").max(100),
});

type AppFormData = z.infer<typeof appSchema>;

interface AppFormProps {
  app?: App;
  companies: Company[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AppForm({ app, companies, open, onClose, onSuccess }: AppFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<AppFormData>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      company_id: app?.company_id || "",
      app_name: app?.app_name || "",
    },
  });

  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".apk")) {
        toast({
          variant: "destructive",
          title: "Invalid file",
          description: "Please select an APK file",
        });
        return;
      }
      setApkFile(file);
    }
  };

  const onSubmit = async (data: AppFormData) => {
    if (!app && !apkFile) {
      toast({
        variant: "destructive",
        title: "APK Required",
        description: "Please select an APK file to upload",
      });
      return;
    }

    setIsLoading(true);
    try {
      let apkUrl = app?.apk_file_url || "";

      // Upload APK if selected
      if (apkFile) {
        const fileName = `${crypto.randomUUID()}.apk`;
        
        const { error: uploadError } = await supabase.storage
          .from("apk-files")
          .upload(fileName, apkFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("apk-files")
          .getPublicUrl(fileName);

        apkUrl = urlData.publicUrl;
      }

      if (app) {
        const { error } = await supabase
          .from("apps")
          .update({ company_id: data.company_id, app_name: data.app_name, apk_file_url: apkUrl })
          .eq("id", app.id);

        if (error) throw error;
        toast({ title: "App updated successfully" });
      } else {
        const { error } = await supabase
          .from("apps")
          .insert({ company_id: data.company_id, app_name: data.app_name, apk_file_url: apkUrl });

        if (error) throw error;
        toast({ title: "App created successfully" });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{app ? "Edit App" : "Add App"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="app_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Company Mobile App" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>APK File {!app && <span className="text-destructive">*</span>}</FormLabel>
              <div className="border-2 border-dashed rounded-lg p-4">
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {apkFile ? apkFile.name : "Click to upload APK"}
                  </span>
                  <input
                    type="file"
                    accept=".apk"
                    className="hidden"
                    onChange={handleApkChange}
                  />
                </label>
              </div>
              {app && !apkFile && (
                <p className="text-sm text-muted-foreground">
                  Current: {app.apk_file_url.split("/").pop()}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {app ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
