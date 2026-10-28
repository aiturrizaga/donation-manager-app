export interface ImagePosition {
  x: number;
  y: number;
  w: number;
  h: number | null;
}

export interface CertificateImageLayout {
  logo?: ImagePosition | null;
  seal?: ImagePosition | null;
  signature?: ImagePosition | null;
}

export interface CertificateTemplate {
  id: number;
  organizationId: number;
  bodyHtml: string;
  footerHtml: string;
  signatureHtml: string;
  imageLayout: CertificateImageLayout | null;
  updatedAt: string | null;
}

export interface CertificateTemplateUpsertRequest {
  bodyHtml: string;
  footerHtml: string;
  signatureHtml: string;
  imageLayout: CertificateImageLayout | null;
}

export interface CertificateVariable {
  name: string;
  label: string;
  category: string;
  sampleValue: string;
}
