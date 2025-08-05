// API Client for backend communication
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    // Try to get accessToken first, then fallback to token
    this.token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    // Get user and organization data
    const user = localStorage.getItem('user');
    const organization = localStorage.getItem('organization');
    let userData = null;
    let organizationId = null;
    let isSuperAdmin = false;
    
    if (user) {
      try {
        userData = JSON.parse(user);
        isSuperAdmin = userData.role === 'SUPER_ADMIN' || userData.isSuperAdmin;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Get organizationId from organization object first, then from user
    if (organization) {
      try {
        const orgData = JSON.parse(organization);
        organizationId = orgData.id;
      } catch (e) {
        console.error('Error parsing organization data:', e);
      }
    }
    
    // Fallback to user organizationId if not found
    if (!organizationId && userData?.organizationId) {
      organizationId = userData.organizationId;
    }
    
    // For specific organization endpoints, don't add X-Organization-ID header
    const isSpecificOrgEndpoint = endpoint.match(/^\/organizations\/[a-zA-Z0-9-]+\//);
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Add X-Organization-ID only if:
        // 1. We have an organizationId AND
        // 2. It's not a specific organization endpoint (like /organizations/{id}/details)
        ...(organizationId && !isSpecificOrgEndpoint && { 'X-Organization-ID': organizationId }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || `API Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', endpoint, error);
      throw error;
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
    }
  }

  // Auth methods
  async login(email, password, organizationId = null) {
    const body = { email, password };
    if (organizationId) {
      body.organizationId = organizationId;
    }
    
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    
    // Handle the response - it may have different formats
    const token = data.accessToken || data.token;
    if (token) {
      this.setToken(token);
      // Store user data with organization info
      const userData = {
        ...data.user,
        organizationId: data.organization?.id || data.user?.organizationId
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store organization separately if provided
      if (data.organization) {
        localStorage.setItem('organization', JSON.stringify(data.organization));
      }
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
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    localStorage.removeItem('refreshToken');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Athletes
  async getAthletes() {
    return this.request('/athletes');
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

  // Teams
  async getTeams() {
    return this.request('/teams');
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

  // Documents
  async getDocuments() {
    return this.request('/documents');
  }

  async createDocument(data) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
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

  // Payments
  async getPayments() {
    return this.request('/payments');
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

  async deletePayment(id) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE'
    });
  }

  // Matches
  async getMatches() {
    return this.request('/matches');
  }

  async createMatch(data) {
    return this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateMatch(id, data) {
    return this.request(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMatch(id) {
    return this.request(`/matches/${id}`, {
      method: 'DELETE'
    });
  }

  // Transport
  async getTransportZones() {
    return this.request('/transport/zones');
  }

  async getBuses() {
    return this.request('/transport/buses');
  }

  async createBus(data) {
    return this.request('/transport/buses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateBus(id, data) {
    return this.request(`/transport/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteBus(id) {
    return this.request(`/transport/buses/${id}`, {
      method: 'DELETE'
    });
  }

  // Organizations (for multi-tenant)
  async getOrganizations() {
    return this.request('/organizations');
  }

  async switchOrganization(organizationId) {
    return this.request('/auth/switch-organization', {
      method: 'POST',
      body: JSON.stringify({ organizationId })
    });
  }
  
  // Organizations methods
  async get(path, options = {}) {
    return this.request(path, {
      ...options,
      method: 'GET'
    });
  }
  
  async patch(path, data, options = {}) {
    return this.request(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
  
  async post(path, data, options = {}) {
    return this.request(path, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...(data instanceof FormData ? {} : { headers: { 'Content-Type': 'application/json' } })
    });
  }

  // Add other methods as needed
}

export const api = new ApiClient();
