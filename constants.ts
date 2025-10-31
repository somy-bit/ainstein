
import { Language, UserRole, LanguageOption, RoleOption, PartnerCategory, ISVPartnerType, ISVTypeOption, PartnerCategoryFilterOption } from './types';

export const APP_NAME = "AInstein - AI Powered PRM";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: Language.EN, name: 'English' },
  { code: Language.ES, name: 'Español' },
  { code: Language.PT, name: 'Português' },
  { code: Language.FR, name: 'Français' },
];

export const USER_ROLES: RoleOption[] = [
  { value: UserRole.PARTNER_SI, label: 'Partner SI' },
  { value: UserRole.PARTNER_ISV, label: 'Partner ISV' },
  { value: UserRole.PARTNER_MANAGER, label: 'Partner Manager' },
  { value: UserRole.ORGANIZATION, label: 'Organization Admin' },
  { value: UserRole.AINSTEIN_ADMIN, label: 'AInstein Super Admin'},
];

export const DEFAULT_LANGUAGE = Language.EN;
export const DEFAULT_ROLE = UserRole.PARTNER_MANAGER;

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
// FIX: Updated deprecated image model to 'imagen-4.0-generate-001' as per guidelines.
export const GEMINI_IMAGE_MODEL = 'imagen-4.0-generate-001'; 
export const GEMINI_CHAT_MODEL = 'gemini-2.5-flash';

export const MOCK_API_KEY_NOTICE = "process.env.API_KEY is not set. Gemini API features will not work. Please set your API key in your environment.";

export const ICON_SIZE = "h-5 w-5";
export const LARGE_ICON_SIZE = "h-8 w-8";

export const PARTNER_CATEGORIES = [ // Used for creating/editing partners
  { value: PartnerCategory.SI, labelKey: 'siPartner' },
  { value: PartnerCategory.ISV, labelKey: 'isvPartner' },
];

export const PARTNER_CATEGORY_FILTER_OPTIONS: PartnerCategoryFilterOption[] = [ // Used for filtering
  { value: 'All', labelKey: 'allCategories' },
  { value: PartnerCategory.SI, labelKey: 'siPartner' },
  { value: PartnerCategory.ISV, labelKey: 'isvPartner' },
];

export const ISV_PARTNER_TYPES: ISVTypeOption[] = [
  { value: 'All', labelKey: 'allIsvTypes' },
  { value: ISVPartnerType.PAYMENT_PROVIDER, labelKey: 'isvTypePaymentProvider' },
  { value: ISVPartnerType.ANTIFRAUD, labelKey: 'isvTypeAntifraud' },
  { value: ISVPartnerType.MARKETING_AUTOMATION, labelKey: 'isvTypeMarketingAutomation' },
  { value: ISVPartnerType.MARKETPLACE, labelKey: 'isvTypeMarketplace' },
  { value: ISVPartnerType.CRM, labelKey: 'isvTypeCRM' },
  { value: ISVPartnerType.ERP, labelKey: 'isvTypeERP' },
  { value: ISVPartnerType.OPERATIONS_LOGISTICS, labelKey: 'isvTypeOperationsLogistics' },
  { value: ISVPartnerType.OTHER, labelKey: 'isvTypeOther' },
];