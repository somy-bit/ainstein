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

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Error handling helper
const handleApiError = (error: Error | TypeError | unknown, showToast?: (message: string, type: 'error') => void) => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    errorMessage = 'Failed to connect to server. Please check if the backend is running on http://localhost:3001';
  } else if (error instanceof Error) {
    // Try to extract error message from API response
    try {
      const errorData = JSON.parse(error.message.split(' - ')[1] || '{}');
      errorMessage = errorData.error || error.message;
    } catch {
      errorMessage = error.message;
    }
  }
  
  if (showToast) {
    showToast(errorMessage, 'error');
  }
  
  throw new Error(errorMessage);
};

const apiCall = async (endpoint: string, options: RequestInit = {}, showToast?: (message: string, type: 'error' | 'success') => void) => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('API Call:', { url, method: options.method || 'GET', headers, body: options.body });

  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    console.log('API Response:', { 
      status: response.status, 
      statusText: response.statusText, 
      ok: response.ok,
      url: response.url 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      const error = new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
      handleApiError(error, showToast);
    }

    // Handle empty responses (like 204 No Content)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }

    const data = await response.json();
    console.log('API Success Response:', data);
    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    handleApiError(error, showToast);
  }
};

// Auth
export const login = async (username: string, password: string, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, showToast);
    
    if (showToast && result) {
      showToast('Login successful!', 'success');
    }
    
    return result;
  } catch (error) {
    // Error already handled by apiCall
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }, showToast);
    
    if (showToast && result) {
      showToast('Password changed successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const registerTrial = async (orgData: OrganizationCreationData, adminData: AdminCreationData, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/auth/register-trial', {
      method: 'POST',
      body: JSON.stringify({ orgData, adminData }),
    }, showToast);
    
    if (showToast && result) {
      showToast('Registration successful! Welcome to your free trial.', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Partners
export const getPartners = async (showToast?: (message: string, type: 'error') => void) => {
  return apiCall('/partners', {}, showToast);
};

export const getPartnerById = async (id: string, showToast?: (message: string, type: 'error') => void) => {
  return apiCall(`/partners/${id}`, {}, showToast);
};

export const addPartner = async (partnerData: PartnerCreationData, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    }, showToast);
    
    if (showToast && result) {
      showToast('Partner added successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const updatePartner = async (id: string, partnerData: Partial<PartnerUpdateData>, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    }, showToast);
    
    if (showToast && result) {
      showToast('Partner updated successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const deletePartner = async (id: string, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall(`/partners/${id}`, { method: 'DELETE' }, showToast);
    
    if (showToast) {
      showToast('Partner deleted successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Leads
export const getLeads = async (showToast?: (message: string, type: 'error') => void) => {
  return apiCall('/leads', {}, showToast);
};

export const addLead = async (leadData: LeadCreationData, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    }, showToast);
    
    if (showToast && result) {
      showToast('Lead added successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateLead = async (id: string, leadData: Partial<LeadCreationData>, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    }, showToast);
    
    if (showToast && result) {
      showToast('Lead updated successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Organizations
export const getOrganizations = async (showToast?: (message: string, type: 'error') => void) => {
  return apiCall('/organizations', {}, showToast);
};

export const addOrganization = async (orgData: OrganizationCreationData, adminData: AdminCreationData, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/organizations', {
      method: 'POST',
      body: JSON.stringify({ orgData, adminData }),
    }, showToast);
    
    if (showToast && result) {
      showToast('Organization added successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateOrganization = async (id: string, orgData: Partial<OrganizationUpdateData>, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orgData),
    }, showToast);
    
    if (showToast && result) {
      showToast('Organization updated successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const getUsersByOrg = async (organizationId: string, showToast?: (message: string, type: 'error') => void) => {
  return apiCall(`/organizations/${organizationId}/users`, {}, showToast);
};

export const getSubscriptionForOrg = async (orgId: string, showToast?: (message: string, type: 'error') => void) => {
  return apiCall(`/organizations/${orgId}/subscription`, {}, showToast);
};

export const uploadKnowledgeFile = async (file: File, showToast?: (message: string, type: 'error' | 'success') => void) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/knowledge/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  
  return response.json();
};

export const downloadKnowledgeFile = async (fileId: string, fileName: string, showToast?: (message: string, type: 'error') => void) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/knowledge/files/${fileId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Download failed');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

export const deleteOrganization = async (orgId: string, showToast?: (message: string, type: 'error' | 'success') => void) => {
  return apiCall(`/organizations/${orgId}`, {
    method: 'DELETE',
  });
};

export const getPlans = async (showToast?: (message: string, type: 'error') => void) => {
  return apiCall('/subscription/plans', {}, showToast);
};

export const cancelSubscription = async (data :{reason?: string,orgId:string}, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify(data),
    }, showToast);
    
    if (showToast && result) {
      showToast('Subscription cancelled successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionStatus = async (showToast?: (message: string, type: 'error') => void) => {
  return apiCall('/subscription/status', {}, showToast);
};

export const getAllSubscriptions = async (showToast?: (message: string, type: 'error') => void) => {
  return apiCall('/subscriptions', {}, showToast);
};

export const createSubscription = async (subscriptionData: SubscriptionCreationData, showToast?: (message: string, type: 'error' | 'success') => void) => {
  return apiCall('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscriptionData),
  });
};

export const updateSubscriptionUsage = async (orgId: string, usageType: string, increment: number, showToast?: (message: string, type: 'error') => void) => {
  return apiCall(`/subscriptions/org/${orgId}/usage`, {
    method: 'PATCH',
    body: JSON.stringify({ usageType, increment }),
  });
};

export const changePlan = async (data: { orgId: string; newPlanId: string }, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/subscriptions/change-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }, showToast);
    
    if (showToast && result) {
      showToast('Plan change scheduled successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const createPaymentIntent = async (data: { amount: number; orgId?: string }, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/subscriptions/payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }, showToast);
    
    if (showToast && result) {
      showToast('Payment intent created successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const getReferralProgramConfig = async (orgId: string, showToast?: (message: string, type: 'error') => void) => {
  return apiCall(`/organizations/${orgId}/referral-config`, {}, showToast);
};

export const updateReferralProgramConfig = async (orgId: string, configData: Partial<ReferralProgramConfig>, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall(`/organizations/${orgId}/referral-config`, {
      method: 'PUT',
      body: JSON.stringify(configData),
    }, showToast);
    
    if (showToast && result) {
      showToast('Commission rates updated successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Users
export const getAllUsers = async (showToast?: (message: string, type: 'error') => void) => {
  return apiCall('/users', {}, showToast);
};

export const addUser = async (userData: UserCreationData, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, showToast);
    
    if (showToast && result) {
      showToast('User added successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<UserCreationData>, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }, showToast);
    
    if (showToast && result) {
      showToast('User updated successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchCurrentUser = async (showToast?: (message: string, type: 'error') => void) => {
  return apiCall('/users/current', {}, showToast);
};

export const deleteUser = async (id: string, showToast?: (message: string, type: 'error' | 'success') => void) => {
  try {
    const result = await apiCall(`/users/${id}`, {
      method: 'DELETE',
    }, showToast);
    
    if (showToast) {
      showToast('User deleted successfully!', 'success');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Posts
export const getPosts = async () => {
  return apiCall('/posts');
};

export const addPost = async (postData: PostCreationData) => {
  return apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

export const updatePost = async (postId: string, content: string) => {
  return apiCall(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
};

export const deletePost = async (postId: string) => {
  console.log('Deleting post with ID:', postId);
  console.log('Full URL will be:', `${API_BASE_URL}/posts/${postId}`);
  return apiCall(`/posts/${postId}`, { method: 'DELETE' });
};

export const addComment = async (postId: string, content: string) => {
  return apiCall(`/posts/${postId}/comments`, { 
    method: 'POST', 
    body: JSON.stringify({ content })
  });
};

// Knowledge & Marketing
export const getKnowledgeFiles = async () => {
  return apiCall('/knowledge/files');
};

export const addKnowledgeFile = async (fileData: FormData | Record<string, unknown>, uploaderName: string) => {
  const isFormData = fileData instanceof FormData;
  
  return apiCall('/knowledge/files', {
    method: 'POST',
    body: isFormData ? fileData : JSON.stringify({ ...fileData, uploader: uploaderName }),
    // Don't override headers completely - let apiCall handle Authorization
    // ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } })
  });
};

export const deleteKnowledgeFile = async (fileId: string) => {
  return apiCall(`/knowledge/files/${fileId}`, { method: 'DELETE' });
};

export const getMarketingEvents = async () => {
  return apiCall('/knowledge/marketing-events');
};

export const addMarketingEvent = async (eventData: MarketingEventCreationData) => {
  return apiCall('/knowledge/marketing-events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
};

// AI
export const proxyGenerateText = async (prompt: string, language: string, useGoogleSearch: boolean) => {
  return apiCall('/ai/generate-text', {
    method: 'POST',
    body: JSON.stringify({ prompt, language, useGoogleSearch }),
  });
};

export const proxySendMessageToChat = async (message: string, history: ChatHistory[], language: string) => {
  return apiCall('/ai/send-message', {
    method: 'POST',
    body: JSON.stringify({ message, history, language }),
  });
};

// Platform config
export const getPlatformStripeConfig = async () => {
  return apiCall('/platform/stripe-config');
};

export const updatePlatformStripeConfig = async (config: PlatformStripeConfig) => {
  return apiCall('/platform/stripe-config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
};

// Plan Template Management
export const getPlanTemplates = () => apiCall('/plan-templates');
export const createPlanTemplate = (template: Omit<PlanTemplate, 'id' | 'createdAt' | 'updatedAt'>) => apiCall('/plan-templates', {
  method: 'POST',
  body: JSON.stringify(template),
});
export const updatePlanTemplate = (id: string, template: Partial<PlanTemplate>) => apiCall(`/plan-templates/${id}`, {
  method: 'PUT',
  body: JSON.stringify(template),
});
export const deletePlanTemplate = (id: string) => apiCall(`/plan-templates/${id}`, {
  method: 'DELETE',
});
