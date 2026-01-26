import { Building2, Landmark, FileText, ShieldCheck } from 'lucide-react';

export const BANCOS = {
  title: 'Instituições Bancárias',
  apiPath: '/user-profile/bancos/',
  icon: Building2,
  listFields: ['bank_name', 'iban', 'owner_name'],
  formFields: [
    { key: 'bank_name', label: 'Nome do Banco', required: true },
    { key: 'owner_name', label: 'Titular', required: true },
    { key: 'iban', label: 'IBAN', required: true },
    { key: 'swift', label: 'SWIFT/BIC' },
  ]
};

export const FINANCAS = {
  title: 'Portal das Finanças',
  apiPath: '/user-profile/financas/',
  icon: Landmark,
  listFields: ['nif', 'last_login'],
  formFields: [
    { key: 'nif', label: 'NIF (Nº Contribuinte)', required: true },
    { key: 'password', label: 'Senha Acesso', type: 'password', required: true },
  ]
};

export const EFATURA = {
  title: 'E-Fatura',
  apiPath: '/user-profile/efatura/',
  icon: FileText,
  listFields: ['fiscal_id', 'status'],
  formFields: [
    { key: 'fiscal_id', label: 'NIF Fiscal', required: true },
    { key: 'password', label: 'Senha Finanças', type: 'password', required: true },
  ]
};

export const SS = {
  title: 'Segurança Social',
  apiPath: '/user-profile/seguranca-social/',
  icon: ShieldCheck,
  listFields: ['ni', 'created_at'],
  formFields: [
    { key: 'ni', label: 'NISS', required: true },
    { key: 'password', label: 'Senha Acesso', type: 'password', required: true },
  ]
};