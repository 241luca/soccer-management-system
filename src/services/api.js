// API Client for backend communication
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    this.token = localStorage.getItem('token');
    this.organizationId = JSON.parse(localStorage.getItem('organization') || '{}')?.id;
  }

  async request(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...(this.organizationId && { 'X-Organization-ID': this.organizationId }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      // Handle 401 separately
      if (response.status === 401) {
        // Token expired or invalid
        console.warn('401 Unauthorized - Token may be expired');
        
        // Only redirect to login if we're not already there
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('organization');
          window.location.href = '/';
        }
        
        throw new Error('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  setOrganization(organization) {
    this.organizationId = organization?.id;
    if (organization) {
      localStorage.setItem('organization', JSON.stringify(organization));
    } else {
      localStorage.removeItem('organization');
    }
  }

  // Auth methods
  async login(email, password, organizationId = null) {
    // Check if it's a super admin login (by email pattern)
    const isSuperAdmin = email.includes('superadmin');
    const endpoint = isSuperAdmin ? '/auth/super-admin/login' : '/auth/login';
    
    const data = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(organizationId && { organizationId }) })
    });
    
    // Handle multi-org selection
    if (data.requiresOrganizationSelection) {
      return data;
    }
    
    // Set tokens with new format
    this.setToken(data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.organization) {
      this.setOrganization(data.organization);
    }
    
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore logout errors
    }
    this.setToken(null);
    this.setOrganization(null);
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Athletes methods
  async getAthletes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/athletes${query ? `?${query}` : ''}`);
  }

  async getAthlete(id) {
    return this.request(`/athletes/${id}`);
  }

  async createAthlete(data) {
    return this.request('/athletes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAthlete(id, data) {
    return this.request(`/athletes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteAthlete(id) {
    return this.request(`/athletes/${id}`, {
      method: 'DELETE'
    });
  }

  async getAthleteStatistics(id) {
    return this.request(`/athletes/${id}/statistics`);
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getDashboardActivity() {
    return this.request('/dashboard/activity');
  }

  // Notifications methods
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    });
  }

  async clearAllNotifications() {
    return this.request('/notifications', {
      method: 'DELETE'
    });
  }

  // Teams methods
  async getTeams(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teams${query ? `?${query}` : ''}`);
  }

  async getTeam(id) {
    return this.request(`/teams/${id}`);
  }

  async createTeam(data) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTeam(id, data) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTeam(id) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE'
    });
  }

  async getTeamStatistics(id) {
    return this.request(`/teams/${id}/statistics`);
  }

  // Documents methods
  async getDocuments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/documents${query ? `?${query}` : ''}`);
  }

  async getDocument(id) {
    return this.request(`/documents/${id}`);
  }

  async createDocument(data) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async uploadDocument(formData) {
    const config = {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` })
        // Don't set Content-Type, let browser set it with boundary for multipart
      }
    };

    const response = await fetch(`${this.baseURL}/documents/upload`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    return response.json();
  }

  async updateDocument(id, data) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE'
    });
  }

  async checkExpiringDocuments(daysAhead = 30) {
    return this.request(`/documents/check-expiring?days=${daysAhead}`);
  }

  // Payments methods
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payments${query ? `?${query}` : ''}`);
  }

  async getPayment(id) {
    return this.request(`/payments/${id}`);
  }

  async createPayment(data) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePayment(id, data) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async recordPayment(id, data) {
    return this.request(`/payments/${id}/record`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async cancelPayment(id, reason) {
    return this.request(`/payments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async deletePayment(id) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE'
    });
  }

  async getPaymentSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payments/summary${query ? `?${query}` : ''}`);
  }

  async checkOverduePayments() {
    return this.request('/payments/check-overdue', {
      method: 'POST'
    });
  }

  // Configuration methods
  async getPaymentTypes() {
    return this.request('/config/payment-types');
  }

  async getDocumentTypes() {
    return this.request('/config/document-types');
  }

  async getPositions() {
    return this.request('/config/positions');
  }

  // User methods
  async changePassword(data) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiClient();
