/**
 * Encabezado en español para cada módulo de permisos — el slug (`module`) es
 * el id inmutable que evalúa el backend, esto es solo la etiqueta visible en
 * los editores de permisos (RoleEditPage, UserExtraGrants).
 */
export const MODULE_LABELS_ES: Record<string, string> = {
  donation: 'Donaciones',
  donation_page: 'Páginas de donación',
  donation_target: 'Objetivos de donación',
  donation_certificate: 'Certificados de donación',
  donor: 'Donantes',
  donor_payment_provider: 'Proveedores de pago del donante',
  form_config_gateway: 'Config. de formulario (pasarela)',
  form_config_target: 'Config. de formulario (objetivo)',
  id_doc_type: 'Tipos de documento',
  organization: 'Organizaciones',
  partner: 'Contactos',
  payment_gateway: 'Pasarelas de pago',
  recurring_subscription: 'Suscripciones recurrentes',
  user: 'Usuarios',
  rbac: 'Roles y permisos',
  complaint: 'Reclamos',
  legal_page: 'Páginas legales',
  lookup: 'Catálogos del sistema',
};

export function moduleLabel(module: string): string {
  return MODULE_LABELS_ES[module] ?? module;
}
