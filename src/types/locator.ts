// Local Grama/Ward Sachivalayam, MeeSeva, E-Seva & Rythu Seva Kendra Types
// Guardrail: Publicly available government service centre metadata & toll-free helplines only.

export type ServiceCentreType =
  | 'sachivalayam'
  | 'meeseva_eseva'
  | 'rythu_seva_kendra'
  | 'collectorate_pgrs';

export interface ServiceCentre {
  id: string;
  district: string;
  pin_code: string;
  type: ServiceCentreType;
  name_en: string;
  name_te: string;
  name_hi: string;
  address_en: string;
  address_te: string;
  address_hi: string;
  lat: number;
  lng: number;
  hours_en: string;
  hours_te: string;
  hours_hi: string;
  helpline: string;
  official_portal_url: string;
  services_en: string[];
  services_te: string[];
  services_hi: string[];
  source: 'curated_ap_gsws' | 'openstreetmap_live';
  distance_km?: number;
}

export interface OfficialHelpline {
  code: string;
  number: string;
  title_en: string;
  title_te: string;
  title_hi: string;
  scope_en: string;
  scope_te: string;
  scope_hi: string;
}

export interface LocatorApiResponse {
  centres: ServiceCentre[];
  helplines: OfficialHelpline[];
  total: number;
  data_source: 'merged_osm_and_curated' | 'curated_ap_gsws';
}
