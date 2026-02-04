export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteLink {
  id: string;
  company_id: string;
  title: string;
  url: string;
  type: 'website' | 'admin';
  created_at: string;
}

export interface App {
  id: string;
  company_id: string;
  app_name: string;
  apk_file_url: string;
  created_at: string;
}

export interface CompanyWithRelations extends Company {
  website_links: WebsiteLink[];
  apps: App[];
}
