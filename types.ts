

export enum Language {
  EN = 'en',
  ES = 'es',
  PT = 'pt',
  FR = 'fr',
}

export enum UserRole {
  PARTNER_SI = 'PartnerSI',
  PARTNER_ISV = 'PartnerISV',
  PARTNER_MANAGER = 'PartnerManager',
  ORGANIZATION = 'Organization', // Can upload files, manage marketing calendar
  AINSTEIN_ADMIN = 'AInsteinAdmin', // Super admin for the platform
}

export interface User {
  id: string;
  username: string;
  name: string; // First Name
  lastNamePaternal?: string;
  lastNameMaternal?: string;
  email?: string;
  phone?: string;
  country?: string;
  role: UserRole;
  password?: string; // For login simulation
  organizationId: string; // A user (except super admin) must belong to an organization
  organizationName?: string; // For convenience
  isActive: boolean;
  connections?: string[]; // Array of partner IDs
  badges?: string[]; // e.g., ['Top Contributor', 'Innovator']
  partnerId?: string; // Links user to a partner company entity
  mfaEnabled: boolean; // For Multi-Factor Authentication
  isGoogleUser?: boolean; // Identifies users who sign in with Google
}

export interface StripeConfig {
    isConnected: boolean;
    publishableKeySet: boolean;
}

export interface Organization {
    id: string;
    name: string;
    isActive: boolean;
    subscriptionId: string;
    // New fields for organization creation
    companyId?: string; // RUT/RUC/ID
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
}

export interface PlanTemplate {
    id: string;
    name: string;
    price: number;
    billingCycle: 'Monthly' | 'Annual';
    trialDays: number;
    stripePriceId?: string;
    features: {
        partnerManagers: { limit: number };
        admins: { limit: number };
        partners: { limit: number };
        textTokens: { limit: number };
        speechToTextMinutes: { limit: number };
        storageGB: { limit: number };
    };
    overageCosts: {
        additionalPartner: number;
        textTokensPer1k: number;
        speechToTextPerMinute: number;
        storagePerGB: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SubscriptionPlan {
    id: string;
    orgId: string;
    planName: 'Free Trial' | 'Esencial' | 'Profesional';
    price: number; // per month. 0 for Free Trial.
    billingCycle: 'Monthly' | 'Annual';
    status: 'Active' | 'Pending Payment' | 'Cancelled' | 'Trial' | 'Expired';
    renewalDate: Date; // For Trial, this is the end date.
    features: {
        partnerManagers: { limit: number };
        admins: { limit: number };
        partners: { limit: number };
        textTokens: { limit: number };
        speechToTextMinutes: { limit: number };
        storageGB: { limit: number };
    };
    usage: {
        partners: { current: number };
        textTokens: { current: number };
        speechToTextMinutes: { current: number };
        storageGB: { current: number };
    };
    overageCosts: {
        additionalPartner: number;
        textTokensPer1k: number;
        speechToTextPerMinute: number;
        storagePerGB: number;
    };
    paymentMethod: {
        type: 'Visa' | 'MasterCard' | 'Not Set';
        last4: string;
        expiry: string;
        cardholderName?: string;
    };
    remainingTrialDays?: number; // Only present for trial subscriptions
}


export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language: Language;
  isDiagram?: boolean;
}

export enum PartnerCategory {
  SI = 'SI', // System Integrator
  ISV = 'ISV', // Independent Software Vendor
}

export enum ISVPartnerType {
  PAYMENT_PROVIDER = 'PaymentProvider',
  ANTIFRAUD = 'Antifraud',
  MARKETING_AUTOMATION = 'MarketingAutomation',
  MARKETPLACE = 'Marketplace',
  CRM = 'CRM',
  ERP = 'ERP',
  OPERATIONS_LOGISTICS = 'OperationsLogistics',
  OTHER = 'Other',
}

export interface Partner {
  id: string;
  name: string;
  tier: string;
  specialization: string;
  region: string;
  performanceScore: number; // 0-100
  contactEmail: string;
  category: PartnerCategory;
  country?: string; 
  isActive: boolean; 
  organizationId: string; // A partner must belong to an organization
  organizationName: string; // For display convenience
  // ISV specific fields
  isvType?: ISVPartnerType;
  phone?: string;
  website?: string;
  logoUrl?: string;
  // Social fields
  description?: string;
  connections?: string[];
  badges?: string[];
}

export enum ReferralType {
    RESELLER = 'Reseller',
    LEAD_REFERRAL = 'LeadReferral',
}

export interface Lead {
  id: string;
  leadName: string;
  partnerId?: string;
  partnerName?: string;
  status: 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Lost';
  createdDate: Date;
  value: number; // Represents the "Initial Net Sale Value"
  // New fields for referral program
  referralType?: ReferralType;
  commissionRateApplied?: number;
  commissionAmount?: number;
  commissionStatus?: 'PendingClientPayment' | 'Earned' | 'Paid' | 'Cancelled';
}

export interface MarketingEvent {
  id:string;
  title: string;
  date: Date;
  description: string;
  language: Language;
  type: 'Webinar' | 'Workshop' | 'Conference' | 'Community Meetup';
  isCommunityEvent?: boolean;
  organizationId: string; // Event is scoped to an organization
}

export interface KnowledgeFile {
  id: string;
  name: string;
  type: string; // e.g., 'pdf', 'docx', 'mp4'
  size: number; // in bytes
  uploadDate: Date;
  uploader: string; // User ID or name
  url?: string; // For links like YouTube/G-Drive
  organizationId: string; // File is scoped to an organization
}

// For Gemini API interactions, if specific types are needed beyond string responses
export interface AISummary {
  title: string;
  summaryText: string;
  actionableInsights?: string[];
}

// Translation structure
export type Translations = {
  [key: string]: string | Translations;
};

export interface LanguageOption {
  code: Language;
  name: string;
}

export interface RoleOption {
  value: UserRole;
  label: string;
}

export type MainView = 'ai_agent' | 'prm_portal';

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
 // Add other possible grounding chunk types if needed
}

export interface ISVTypeOption {
  value: ISVPartnerType | 'All';
  labelKey: string; // To be used with t() for localization
}

export interface CountryOption {
  value: string; // Country name or code
  label: string; // Display label (country name)
}

export interface PartnerCategoryFilterOption {
  value: PartnerCategory | 'All';
  labelKey: string;
}

// Partner Network Types
export interface Post {
    id: string;
    authorId: string; // Partner or User ID
    authorName: string;
    authorLogoUrl?: string;
    content: string;
    timestamp: Date;
    likes: number;
    comments: Comment[];
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: Date;
}

export interface CommunityGroup {
    id: string;
    name: string;
    description: string;
    memberCount: number;
}

export interface ReferralProgramConfig {
    orgId: string;
    resellerCommissionRate: number;
    leadReferralCommissionRate: number;
    lastUpdated: Date;
    updatedBy: string; // User name for simplicity
}

// Stripe Payment Types
export interface StripePaymentIntent {
    id: string;
    status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled';
    amount: number;
    currency: string;
    cardholderName?: string;
    last4?: string;
    payment_method?: string;
}

export interface StripePaymentMethod {
    id: string;
    type: 'card';
    card?: {
        last4: string;
        brand: string;
        exp_month: number;
        exp_year: number;
    };
    billing_details?: {
        name?: string;
        email?: string;
    };
}

// Speech Recognition Types
export interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

export interface SpeechRecognitionErrorEvent {
    error: string;
    message?: string;
}

// Organization Creation Types
export interface OrganizationCreationData {
    name: string;
    companyId?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
}

// TODO: ROLLBACK MARKER - Added separate interface for organization updates
export interface OrganizationUpdateData extends OrganizationCreationData {
    isActive?: boolean;
}

export interface AdminCreationData {
    name: string;
    lastNamePaternal?: string;
    lastNameMaternal?: string;
    email: string;
    phone?: string;
    country?: string;
    username: string;
    password: string;
}

// API Data Types
export interface PartnerCreationData {
    name: string;
    tier: string;
    specialization: string;
    region: string;
    contactEmail: string;
    category: PartnerCategory;
    country?: string;
    isvType?: ISVPartnerType;
    phone?: string;
    website?: string;
    logoUrl?: string;
    description?: string;
}

// TODO: ROLLBACK MARKER - Added separate interface for partner updates
export interface PartnerUpdateData extends PartnerCreationData {
    isActive?: boolean;
}

export interface UserCreationData {
    username: string;
    name: string;
    lastNamePaternal?: string;
    lastNameMaternal?: string;
    email?: string;
    phone?: string;
    country?: string;
    role: UserRole;
    password: string;
    organizationId: string;
    isActive?: boolean; // TODO: ROLLBACK MARKER - Added for user management
}

export interface LeadCreationData {
    leadName: string;
    partnerId?: string;
    status: 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Lost';
    value: number;
    referralType?: ReferralType;
}

export interface MarketingEventCreationData {
    title: string;
    date: Date;
    description: string;
    language: Language;
    type: 'Webinar' | 'Workshop' | 'Conference' | 'Community Meetup';
    isCommunityEvent?: boolean;
}

export interface SubscriptionCreationData {
    orgId: string;
    planName: 'Free Trial' | 'Esencial' | 'Profesional';
    price: number;
    billingCycle: 'Monthly' | 'Annual';
}

export interface PostCreationData {
    content: string;
    authorId: string;
    authorName: string;
    authorLogoUrl?: string;
}

export interface PlatformStripeConfig {
    publishableKey?: string;
    secretKey?: string;
    isConnected: boolean;
}

export interface ChatHistory {
    role: 'user' | 'assistant';
    content: string;
}

// Plan transformation types for RegisterPage
export interface TransformedPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    trialDays: number;
    features: string[];
    limits?: { // TODO: ROLLBACK MARKER - Added for RegisterPage compatibility
        partnerManagers: number;
        admins: number;
        partners: number;
        textTokens: number;
        speechToTextMinutes: number;
        storageGB: number;
    };
}

export interface TransformedPlansData {
    plans: Record<string, TransformedPlan>;
}

// Auth context types
export interface PendingLoginData {
    user: User;
    organization: Organization;
    subscription: SubscriptionPlan;
    token?: string;
}

// Error handling utility
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unknown error occurred';
};