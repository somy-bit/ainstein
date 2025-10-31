import { useToast } from '../components/common/Toast';
import * as api from '../services/backendApiService';
import { 
  OrganizationCreationData, 
  OrganizationUpdateData,
  AdminCreationData, 
  PartnerCreationData, 
  PartnerUpdateData,
  UserCreationData, 
  LeadCreationData, 
  MarketingEventCreationData, 
  SubscriptionCreationData, 
  PostCreationData, 
  PlatformStripeConfig, 
  ChatHistory,
  ReferralProgramConfig,
  PlanTemplate
} from '../types';

export const useApiWithToast = () => {
  const { showToast } = useToast();

  // Create wrapped API functions that automatically use toast
  const apiWithToast = {
    // Auth
    login: (username: string, password?: string) => 
      api.login(username, password, showToast),
    
    changePassword: (currentPassword: string, newPassword: string) => 
      api.changePassword(currentPassword, newPassword, showToast),
    
    registerTrial: (orgData: OrganizationCreationData, adminData: AdminCreationData) => 
      api.registerTrial(orgData, adminData, showToast),

    // Partners
    getPartners: () => api.getPartners(showToast),
    
    getPartnerById: (id: string) => api.getPartnerById(id, showToast),
    
    addPartner: (partnerData: PartnerCreationData) => api.addPartner(partnerData, showToast),
    
    updatePartner: (id: string, partnerData: Partial<PartnerUpdateData>) => 
      api.updatePartner(id, partnerData, showToast),
    
    deletePartner: (id: string) => api.deletePartner(id, showToast),

    // Users
    getAllUsers: () => api.getAllUsers(showToast),
    
    addUser: (userData: UserCreationData) => api.addUser(userData, showToast),
    
    updateUser: (id: string, userData: Partial<UserCreationData>) => 
      api.updateUser(id, userData, showToast),
    
    fetchCurrentUser: () => api.fetchCurrentUser(showToast),
    
    deleteUser: (id: string) => api.deleteUser(id, showToast),

    // Leads
    getLeads: () => api.getLeads(showToast),
    addLead: (leadData: LeadCreationData) => api.addLead(leadData, showToast),
    updateLead: (id: string, leadData: Partial<LeadCreationData>) => api.updateLead(id, leadData, showToast),

    // Organizations
    getOrganizations: () => api.getOrganizations(showToast),
    addOrganization: (orgData: OrganizationCreationData, adminData: AdminCreationData) => api.addOrganization(orgData, adminData, showToast),
    updateOrganization: (id: string, orgData: Partial<OrganizationUpdateData>) => api.updateOrganization(id, orgData, showToast),
    getUsersByOrg: (organizationId: string) => api.getUsersByOrg(organizationId, showToast),
    getSubscriptionForOrg: (orgId: string) => api.getSubscriptionForOrg(orgId, showToast),
    deleteOrganization: (orgId: string) => api.deleteOrganization(orgId, showToast),

    // Knowledge & Files
    uploadKnowledgeFile: (file: File) => api.uploadKnowledgeFile(file, showToast),
    downloadKnowledgeFile: (fileId: string, fileName: string) => api.downloadKnowledgeFile(fileId, fileName, showToast),
    getKnowledgeFiles: () => api.getKnowledgeFiles(showToast),
    addKnowledgeFile: (fileData: FormData | Record<string, unknown>, uploaderName: string) => api.addKnowledgeFile(fileData, uploaderName, showToast),
    deleteKnowledgeFile: (fileId: string) => api.deleteKnowledgeFile(fileId, showToast),
    getMarketingEvents: () => api.getMarketingEvents(showToast),
    addMarketingEvent: (eventData: MarketingEventCreationData) => api.addMarketingEvent(eventData, showToast),

    // Subscriptions
    getPlans: () => api.getPlans(showToast),
    cancelSubscription: (data: {reason?: string, orgId: string}) => api.cancelSubscription(data, showToast),
    getSubscriptionStatus: () => api.getSubscriptionStatus(showToast),
    getAllSubscriptions: () => api.getAllSubscriptions(showToast),
    createSubscription: (subscriptionData: SubscriptionCreationData) => api.createSubscription(subscriptionData, showToast),
    updateSubscriptionUsage: (orgId: string, usageType: string, increment: number) => 
      api.updateSubscriptionUsage(orgId, usageType, increment, showToast),
    createPaymentIntent: (data: { amount: number; orgId?: string }) => api.createPaymentIntent(data, showToast),
    changePlan: (data: { orgId: string; newPlanId: string }) => api.changePlan(data, showToast),

    // Referral Program
    getReferralProgramConfig: (orgId: string) => api.getReferralProgramConfig(orgId, showToast),
    updateReferralProgramConfig: (orgId: string, configData: Partial<ReferralProgramConfig>) => 
      api.updateReferralProgramConfig(orgId, configData, showToast),

    // Posts
    getPosts: () => api.getPosts(showToast),
    addPost: (postData: PostCreationData) => api.addPost(postData, showToast),
    updatePost: (postId: string, content: string) => api.updatePost(postId, content, showToast),
    deletePost: (postId: string) => api.deletePost(postId, showToast),
    addComment: (postId: string, content: string) => api.addComment(postId, content, showToast),

    // AI
    proxyGenerateText: (prompt: string, language: string, useGoogleSearch: boolean) => 
      api.proxyGenerateText(prompt, language, useGoogleSearch, showToast),
    proxySendMessageToChat: (message: string, history: ChatHistory[], language: string) => 
      api.proxySendMessageToChat(message, history, language, showToast),

    // Platform
    getPlatformStripeConfig: () => api.getPlatformStripeConfig(showToast),
    updatePlatformStripeConfig: (config: PlatformStripeConfig) => api.updatePlatformStripeConfig(config, showToast),

    // Plan Templates
    getPlanTemplates: () => api.getPlanTemplates(showToast),
    createPlanTemplate: (template: Omit<PlanTemplate, 'id' | 'createdAt' | 'updatedAt'>) => api.createPlanTemplate(template, showToast),
    updatePlanTemplate: (id: string, template: Partial<PlanTemplate>) => api.updatePlanTemplate(id, template, showToast),
    deletePlanTemplate: (id: string) => api.deletePlanTemplate(id, showToast),
  };

  return apiWithToast;
};
