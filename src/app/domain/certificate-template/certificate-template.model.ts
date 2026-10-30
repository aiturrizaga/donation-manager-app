/** Fraction (0..1) of the image's natural width/height trimmed off each side. */
export interface ImageCrop {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ImagePosition {
  x: number;
  y: number;
  w: number;
  h: number | null;
  crop?: ImageCrop | null;
}

/** Signature line, in mm: `x` from the page's left edge, `w` its length.
 * Its vertical position always follows the data table. */
export interface SignatureLinePosition {
  x: number;
  w: number;
}

export interface CertificateImageLayout {
  logo?: ImagePosition | null;
  seal?: ImagePosition | null;
  signature?: ImagePosition | null;
  signatureLine?: SignatureLinePosition | null;
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
