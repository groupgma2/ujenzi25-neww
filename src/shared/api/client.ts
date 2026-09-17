import { ApiResponse, PaginatedResponse } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('ujenzi25_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('ujenzi25_auth_token', token);
    } else {
      localStorage.removeItem('ujenzi25_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('ujenzi25_refresh_token');
    if (!refreshToken) return false;
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = { message: 'Unexpected server response' };
      }
      if (data?.token) {
        this.setToken(data.token);
        if (data.refreshToken) {
          localStorage.setItem('ujenzi25_refresh_token', data.refreshToken);
        }
        return true;
      }
    } catch {
      // ignore refresh failures
    }
    return false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const sentToken = this.token;
    if (sentToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${sentToken}`;
    }

    const controller = new AbortController();
    // default timeout 15s to avoid hanging requests on poor networks / SW issues
    const timeoutMs = Number(import.meta.env.VITE_API_REQUEST_TIMEOUT) || 15000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);

      clearTimeout(timeout);

      // read + parse the body first so we can surface the server's real message
      const rawText = await response.text();
      let data: any = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = { message: rawText.slice(0, 200) || 'Unexpected server response' };
        }
      }

      if (response.status === 401) {
        const isCredentialCall = endpoint === '/auth/login' || endpoint === '/auth/register';
        // If a NEW session was established while this request was in flight, never let
        // this stale 401 wipe it (this used to log users out right after logging in).
        const sessionStillCurrent = sentToken === this.token;

        if (!isCredentialCall && retry && sentToken && sessionStillCurrent) {
          const refreshed = await this.tryRefresh();
          if (refreshed) {
            return this.request<T>(endpoint, options, false);
          }
        }

        if (isCredentialCall) {
          // Wrong email/password -> show the server's own message, do not redirect.
          return {
            data: null,
            error: {
              code: data?.code || 'UNAUTHORIZED',
              message: data?.message || 'Invalid email or password',
              details: data?.details,
            },
          };
        }

        if (sessionStillCurrent) {
          this.setToken(null);
          window.location.href = '/login';
        }
        return {
          data: null,
          error: { code: 'UNAUTHORIZED', message: data?.message || 'Session expired' },
        };
      }

      if (!response.ok) {
        return {
          data: null,
          error: {
            code: data?.code || 'ERROR',
            message: data?.message || 'An error occurred',
            details: data?.details,
          },
        };
      }

      return { data, error: null };
    } catch (error) {
      if ((error as any)?.name === 'AbortError') {
        return {
          data: null,
          error: { code: 'NETWORK_TIMEOUT', message: 'Request timed out' },
        };
      }
      return {
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.request<T>(`${endpoint}${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        return { data: null, error: { code: 'UNAUTHORIZED', message: 'Session expired' } };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            code: data.code || 'ERROR',
            message: data.message || 'Upload failed',
            details: data.details,
          },
        };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // Paginated requests
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 12,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    return this.get<PaginatedResponse<T>>(endpoint, { page, limit, ...params });
  }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
  login: (email: string, password: string, rememberMe?: boolean) =>
    api.post<{ user: any; token: string; refreshToken: string }>('/auth/login', { email, password, rememberMe }),

  register: (data: any) =>
    api.post<{ user: any; token: string; refreshToken: string }>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),

  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),

  getMe: () => api.get<any>('/auth/me'),

  updateProfile: (data: any) => api.put<any>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.upload<any>('/auth/avatar', formData);
  },
};

// Consultation API
export const consultationApi = {
  getDrawingTypes: () => api.get<any[]>('/consultation/drawing-types'),

  createRequest: (data: any) => api.post<any>('/consultation/requests', data),

  getMyRequests: (page?: number, limit?: number) =>
    api.getPaginated<any>('/consultation/requests/my', page, limit),

  getRequest: (id: string) => api.get<any>(`/consultation/requests/${id}`),

  updateRequest: (id: string, data: any) => api.put<any>(`/consultation/requests/${id}`, data),

  deleteRequest: (id: string) => api.delete(`/consultation/requests/${id}`),

  getQuote: (requestId: string) => api.get<any>(`/consultation/requests/${requestId}/quote`),

  acceptQuote: (requestId: string) => api.post(`/consultation/requests/${requestId}/quote/accept`),

  rejectQuote: (requestId: string, reason?: string) =>
    api.post(`/consultation/requests/${requestId}/quote/reject`, { reason }),

  requestRevision: (requestId: string, notes: string) =>
    api.post(`/consultation/requests/${requestId}/revision`, { notes }),

  uploadFiles: (requestId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.upload<any>(`/consultation/requests/${requestId}/files`, formData);
  },

  deleteFile: (requestId: string, fileId: string) =>
    api.delete(`/consultation/requests/${requestId}/files/${fileId}`),

  getMessages: (requestId: string, page?: number, limit?: number) =>
    api.getPaginated<any>(`/consultation/requests/${requestId}/messages`, page, limit),

  sendMessage: (requestId: string, content: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    attachments?.forEach((file) => formData.append('attachments', file));
    return api.upload<any>(`/consultation/requests/${requestId}/messages`, formData);
  },

  // Admin/Company endpoints
  getAllRequests: (page?: number, limit?: number, filters?: any) =>
    api.getPaginated<any>('/consultation/requests', page, limit, filters),

  assignConsultant: (requestId: string, consultantId: string) =>
    api.post(`/consultation/requests/${requestId}/assign`, { consultantId }),

  createQuote: (requestId: string, data: any) =>
    api.post(`/consultation/requests/${requestId}/quote`, data),

  updateQuote: (quoteId: string, data: any) => api.put(`/consultation/quotes/${quoteId}`, data),

  deliverFiles: (requestId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.upload(`/consultation/requests/${requestId}/deliver`, formData);
  },
};

// Construction API
export const constructionApi = {
  // Materials
  getMaterials: (page?: number, limit?: number, filters?: any) =>
    api.getPaginated<any>('/construction/materials', page, limit, filters),

  getMaterial: (id: string) => api.get<any>(`/construction/materials/${id}`),

  getCategories: () => api.get<any[]>('/construction/materials/categories'),

  createMaterial: (data: any) => api.post('/construction/materials', data),

  updateMaterial: (id: string, data: any) => api.put(`/construction/materials/${id}`, data),

  deleteMaterial: (id: string) => api.delete(`/construction/materials/${id}`),

  // Orders
  createOrder: (data: any) => api.post('/construction/orders', data),

  getMyOrders: (page?: number, limit?: number) =>
    api.getPaginated<any>('/construction/orders/my', page, limit),

  getOrder: (id: string) => api.get<any>(`/construction/orders/${id}`),

  cancelOrder: (id: string, reason?: string) => api.post(`/construction/orders/${id}/cancel`, { reason }),

  trackOrder: (id: string) => api.get<any>(`/construction/orders/${id}/tracking`),

  // Labour
  getLabourCategories: () => api.get<any[]>('/construction/labour/categories'),

  postJob: (data: any) => api.post('/construction/labour/jobs', data),

  getJobs: (page?: number, limit?: number, filters?: any) =>
    api.getPaginated<any>('/construction/labour/jobs', page, limit, filters),

  getJob: (id: string) => api.get<any>(`/construction/labour/jobs/${id}`),

  getMyJobs: (page?: number, limit?: number) =>
    api.getPaginated<any>('/construction/labour/jobs/my', page, limit),

  applyToJob: (jobId: string, data: any) => api.post(`/construction/labour/jobs/${jobId}/apply`, data),

  getApplications: (jobId: string) => api.get<any[]>(`/construction/labour/jobs/${jobId}/applications`),

  hireApplicant: (jobId: string, applicantId: string) =>
    api.post(`/construction/labour/jobs/${jobId}/hire`, { applicantId }),

  updateJobStatus: (jobId: string, status: string) =>
    api.patch(`/construction/labour/jobs/${jobId}`, { status }),

  uploadProgressPhotos: (jobId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.upload(`/construction/labour/jobs/${jobId}/progress`, formData);
  },

  completeJob: (jobId: string, completionData: any) =>
    api.post(`/construction/labour/jobs/${jobId}/complete`, completionData),

  rateLabourTeam: (jobId: string, rating: number, comment: string) =>
    api.post(`/construction/labour/jobs/${jobId}/rate`, { rating, comment }),
};

// Real Estate API
export const realEstateApi = {
  getProperties: (page?: number, limit?: number, filters?: any) =>
    api.getPaginated<any>('/real-estate/properties', page, limit, filters),

  getProperty: (id: string) => api.get<any>(`/real-estate/properties/${id}`),

  getMyProperties: (page?: number, limit?: number) =>
    api.getPaginated<any>('/real-estate/properties/my', page, limit),

  createProperty: (data: any) => api.post('/real-estate/properties', data),

  updateProperty: (id: string, data: any) => api.put(`/real-estate/properties/${id}`, data),

  deleteProperty: (id: string) => api.delete(`/real-estate/properties/${id}`),

  verifyProperty: (id: string, data: any) => api.post(`/real-estate/properties/${id}/verify`, data),

  enquire: (id: string, data: any) => api.post(`/real-estate/properties/${id}/enquire`, data),

  scheduleViewing: (id: string, data: any) => api.post(`/real-estate/properties/${id}/viewing`, data),

  makeOffer: (id: string, data: any) => api.post(`/real-estate/properties/${id}/offer`, data),

  getPropertyTypes: () => api.get<any[]>('/real-estate/property-types'),

  // Development
  createDevelopmentProposal: (data: any) => api.post('/real-estate/development', data),

  getDevelopmentProjects: (page?: number, limit?: number) =>
    api.getPaginated<any>('/real-estate/development', page, limit),

  getDevelopmentProject: (id: string) => api.get<any>(`/real-estate/development/${id}`),

  updateMilestone: (projectId: string, milestoneId: string, data: any) =>
    api.put(`/real-estate/development/${projectId}/milestones/${milestoneId}`, data),

  uploadProgressPhotos: (projectId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.upload(`/real-estate/development/${projectId}/progress`, formData);
  },
};

// Rental API
export const rentalApi = {
  getListings: (page?: number, limit?: number, filters?: any) =>
    api.getPaginated<any>('/rental/listings', page, limit, filters),

  getListing: (id: string) => api.get<any>(`/rental/listings/${id}`),

  getMyListings: (page?: number, limit?: number) =>
    api.getPaginated<any>('/rental/listings/my', page, limit),

  createListing: (data: any) => api.post('/rental/listings', data),

  updateListing: (id: string, data: any) => api.put(`/rental/listings/${id}`, data),

  deleteListing: (id: string) => api.delete(`/rental/listings/${id}`),

  apply: (id: string, data: any) => api.post(`/rental/listings/${id}/apply`, data),

  getApplications: (listingId: string) => api.get<any[]>(`/rental/listings/${listingId}/applications`),

  approveApplication: (listingId: string, applicationId: string) =>
    api.post(`/rental/listings/${listingId}/applications/${applicationId}/approve`),

  rejectApplication: (listingId: string, applicationId: string, reason?: string) =>
    api.post(`/rental/listings/${listingId}/applications/${applicationId}/reject`, { reason }),

  getLeaseAgreement: (listingId: string, applicationId: string) =>
    api.get<any>(`/rental/listings/${listingId}/applications/${applicationId}/lease`),

  signLease: (listingId: string, applicationId: string) =>
    api.post(`/rental/listings/${listingId}/applications/${applicationId}/sign`),

  makePayment: (listingId: string, data: any) =>
    api.post(`/rental/listings/${listingId}/payments`, data),

  getPaymentHistory: (listingId: string) => api.get<any[]>(`/rental/listings/${listingId}/payments`),

  getHouseTypes: () => api.get<any[]>('/rental/house-types'),
};

// Hotels API
export const hotelsApi = {
  getListings: (page?: number, limit?: number, filters?: any) =>
    api.getPaginated<any>('/hotels/listings', page, limit, filters),

  getListing: (id: string) => api.get<any>(`/hotels/listings/${id}`),

  getMyListings: (page?: number, limit?: number) =>
    api.getPaginated<any>('/hotels/listings/my', page, limit),

  createListing: (data: any) => api.post('/hotels/listings', data),

  updateListing: (id: string, data: any) => api.put(`/hotels/listings/${id}`, data),

  deleteListing: (id: string) => api.delete(`/hotels/listings/${id}`),

  checkAvailability: (id: string, checkIn: string, checkOut: string) =>
    api.get<any>(`/hotels/listings/${id}/availability`, { checkIn, checkOut }),

  createBooking: (id: string, data: any) => api.post(`/hotels/listings/${id}/bookings`, data),

  getMyBookings: (page?: number, limit?: number) =>
    api.getPaginated<any>('/hotels/bookings/my', page, limit),

  getBooking: (id: string) => api.get<any>(`/hotels/bookings/${id}`),

  cancelBooking: (id: string, reason?: string) => api.post(`/hotels/bookings/${id}/cancel`, { reason }),

  getReviews: (listingId: string, page?: number, limit?: number) =>
    api.getPaginated<any>(`/hotels/listings/${listingId}/reviews`, page, limit),

  createReview: (listingId: string, data: any) => api.post(`/hotels/listings/${listingId}/reviews`, data),

  getHotelTypes: () => api.get<any[]>('/hotels/types'),

  getRoomTypes: () => api.get<any[]>('/hotels/room-types'),
};

// Portfolio API
export const portfolioApi = {
  getProjects: (page?: number, limit?: number, filters?: any) =>
    api.getPaginated<any>('/portfolio/projects', page, limit, filters),

  getProject: (id: string) => api.get<any>(`/portfolio/projects/${id}`),

  getFeaturedProjects: () => api.get<any[]>('/portfolio/projects/featured'),

  getCategories: () => api.get<any[]>('/portfolio/categories'),

  createProject: (data: any) => api.post('/portfolio/projects', data),

  updateProject: (id: string, data: any) => api.put(`/portfolio/projects/${id}`, data),

  deleteProject: (id: string) => api.delete(`/portfolio/projects/${id}`),

  uploadImages: (projectId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.upload(`/portfolio/projects/${projectId}/images`, formData);
  },
};

// Blog API
export const blogApi = {
  getArticles: (page?: number, limit?: number, filters?: any) =>
    api.getPaginated<any>('/blog/articles', page, limit, filters),

  getArticle: (slug: string) => api.get<any>(`/blog/articles/${slug}`),

  getFeaturedArticles: () => api.get<any[]>('/blog/articles/featured'),

  getCategories: () => api.get<any[]>('/blog/categories'),

  createArticle: (data: any) => api.post('/blog/articles', data),

  updateArticle: (slug: string, data: any) => api.put(`/blog/articles/${slug}`, data),

  deleteArticle: (slug: string) => api.delete(`/blog/articles/${slug}`),

  subscribeNewsletter: (email: string) => api.post('/blog/newsletter', { email }),
};

// Payments API
export const paymentsApi = {
  getMethods: () => api.get<any[]>('/payments/methods'),

  initiatePayment: (data: any) => api.post('/payments/initiate', data),

  verifyPayment: (reference: string) => api.get<any>(`/payments/verify/${reference}`),

  getHistory: (page?: number, limit?: number) =>
    api.getPaginated<any>('/payments/history', page, limit),

  getInvoice: (id: string) => api.get<any>(`/payments/invoices/${id}`),

  downloadInvoice: (id: string) => api.get<any>(`/payments/invoices/${id}/download`),

  requestRefund: (paymentId: string, reason: string) =>
    api.post(`/payments/${paymentId}/refund`, { reason }),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (page?: number, limit?: number) =>
    api.getPaginated<any>('/notifications', page, limit),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.post('/notifications/read-all'),

  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),

  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
};

// Messages API
export const messagesApi = {
  getThreads: (page?: number, limit?: number) =>
    api.getPaginated<any>('/messages/threads', page, limit),

  getThread: (id: string) => api.get<any>(`/messages/threads/${id}`),

  createThread: (data: any) => api.post('/messages/threads', data),

  sendMessage: (threadId: string, content: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    attachments?.forEach((file) => formData.append('attachments', file));
    return api.upload(`/messages/threads/${threadId}/messages`, formData);
  },

  markAsRead: (threadId: string) => api.patch(`/messages/threads/${threadId}/read`),

  getUnreadCount: () => api.get<{ count: number }>('/messages/unread-count'),
};

// Search API
export const searchApi = {
  globalSearch: (query: string, filters?: any) =>
    api.post<any>('/search/global', { query, ...filters }),

  getSuggestions: (query: string) => api.get<any[]>('/search/suggestions', { q: query }),

  getFilters: (category: string) => api.get<any>(`/search/filters/${category}`),
};

export default api;