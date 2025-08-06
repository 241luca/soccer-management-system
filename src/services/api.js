// API Client for backend communication
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    // Try to get accessToken first, then fallback to token
    this.token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    // Refresh token from localStorage before each request
    this.refreshToken();
  }
  
  refreshToken() {
    this.token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  }

  // Helper function per pulire i dati prima di inviarli al backend
  cleanDataForBackend(data, entityType = 'general') {
    const cleaned = { ...data };
    
    // Rimuovi campi vuoti o null
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === null || cleaned[key] === '' || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    
    // Pulisci formato telefono (rimuovi tutto tranne numeri e +)
    const phoneFields = ['phone', 'presidentPhone', 'secretaryPhone'];
    phoneFields.forEach(field => {
      if (cleaned[field]) {
        cleaned[field] = cleaned[field].replace(/[^+\d]/g, '');
      }
    });
    
    // Pulisci formato CAP (solo numeri)
    if (cleaned.postalCode) {
      cleaned.postalCode = cleaned.postalCode.replace(/\D/g, '');
    }
    
    // Pulisci formato codice fiscale (uppercase)
    if (cleaned.fiscalCode) {
      cleaned.fiscalCode = cleaned.fiscalCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    // Pulisci formato partita IVA (solo numeri)
    if (cleaned.vatNumber) {
      cleaned.vatNumber = cleaned.vatNumber.replace(/\D/g, '');
    }
    
    // Pulisci formato IBAN (uppercase, no spazi)
    if (cleaned.iban) {
      cleaned.iban = cleaned.iban.toUpperCase().replace(/\s/g, '');
    }
    
    // Converti tutte le date in formato ISO 8601
    const dateFields = ['birthDate', 'issueDate', 'expiryDate', 'dueDate', 'paidDate', 
                       'date', 'trialEndsAt', 'lastLogin', 'lockedUntil'];
    dateFields.forEach(field => {
      if (cleaned[field] && !cleaned[field].includes('T')) {
        cleaned[field] = `${cleaned[field]}T00:00:00.000Z`;
      }
    });
    
    // Logica specifica per atleti
    if (entityType === 'athlete') {
      // Converti age in birthDate se presente
      if (cleaned.age !== undefined && !cleaned.birthDate) {
        const birthYear = new Date().getFullYear() - cleaned.age;
        cleaned.birthDate = `${birthYear}-01-01T00:00:00.000Z`;
        delete cleaned.age;
      }
      
      // Converti campi legacy
      if (cleaned.number !== undefined) {
        cleaned.jerseyNumber = cleaned.number;
        delete cleaned.number;
      }
      
      if (cleaned.usesBus !== undefined) {
        cleaned.usesTransport = cleaned.usesBus;
        delete cleaned.usesBus;
      }
      
      // Rimuovi campi atleta non accettati
      const athleteFieldsToRemove = ['name', 'assignedBus', 'zone', 'membershipFee', 
                                    'feeStatus', 'medicalExpiry', 'insuranceExpiry', 'busFee', 
                                    'busFeeStatus', 'gamesPlayed', 'goals', 'yellowCards', 
                                    'redCards', 'position'];
      athleteFieldsToRemove.forEach(field => delete cleaned[field]);
    }
    
    // Rimuovi sempre l'id dal body (va nell'URL)
    delete cleaned.id;
    
    return cleaned;
  }

  async request(endpoint, options = {}) {
    // Refresh token before each request
    this.refreshToken();
    
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
    
    // For Super Admin, use Demo organization if no organization is set
    if (!organizationId && isSuperAdmin) {
      organizationId = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e'; // Demo Soccer Club ID (real ID in DB)
      console.log('Super Admin: Using default Demo organization ID');
    }
    
    // Debug logging
    console.log(`API Request to ${endpoint}:`, {
      hasToken: !!this.token,
      organizationId,
      isSuperAdmin,
      userData: userData?.email
    });
    
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
        // Add Super Admin header if needed
        ...(isSuperAdmin && { 'X-Super-Admin': 'true' }),
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
  
  async register(data) {
    const cleanData = this.cleanDataForBackend(data, 'user');
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  }
  
  async updateProfile(data) {
    const cleanData = this.cleanDataForBackend(data, 'user');
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(cleanData)
    });
  }
  
  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
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
    console.log('createAthlete called with:', data);
    
    // Usa la funzione helper per pulire i dati specificando il tipo
    const cleanData = this.cleanDataForBackend(data, 'athlete');
    
    console.log('Clean data to send:', cleanData);
    
    return this.request('/athletes', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  }

  async updateAthlete(id, data) {
    console.log('updateAthlete called with:', { id, data });
    
    // Usa la funzione helper per pulire i dati specificando il tipo
    const cleanData = this.cleanDataForBackend(data, 'athlete');
    
    console.log('Clean data to send:', cleanData);
    console.log('Clean data JSON:', JSON.stringify(cleanData, null, 2));
    
    return this.request(`/athletes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData)
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
    const cleanData = this.cleanDataForBackend(data, 'document');
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  }

  async updateDocument(id, data) {
    const cleanData = this.cleanDataForBackend(data, 'document');
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData)
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
    const cleanData = this.cleanDataForBackend(data, 'payment');
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  }

  async updatePayment(id, data) {
    const cleanData = this.cleanDataForBackend(data, 'payment');
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData)
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
    const cleanData = this.cleanDataForBackend(data, 'match');
    return this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  }

  async updateMatch(id, data) {
    const cleanData = this.cleanDataForBackend(data, 'match');
    return this.request(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData)
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
  
  async createOrganization(data) {
    const cleanData = this.cleanDataForBackend(data, 'organization');
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  }
  
  async updateOrganization(id, data) {
    const cleanData = this.cleanDataForBackend(data, 'organization');
    return this.request(`/organizations/${id}`, {
      method: 'PUT', 
      body: JSON.stringify(cleanData)
    });
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
    // Determina il tipo di entità dal path
    let entityType = 'general';
    if (path.includes('/athletes')) entityType = 'athlete';
    else if (path.includes('/organizations')) entityType = 'organization';
    else if (path.includes('/staff')) entityType = 'staff';
    else if (path.includes('/documents')) entityType = 'document';
    else if (path.includes('/payments')) entityType = 'payment';
    else if (path.includes('/matches')) entityType = 'match';
    
    const cleanData = this.cleanDataForBackend(data, entityType);
    
    return this.request(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(cleanData)
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

  // Staff
  async getStaffMembers() {
    return this.request('/staff');
  }
  
  async createStaffMember(data) {
    const cleanData = this.cleanDataForBackend(data, 'staff');
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  }
  
  async updateStaffMember(id, data) {
    const cleanData = this.cleanDataForBackend(data, 'staff');
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData)
    });
  }
  
  async deleteStaffMember(id) {
    return this.request(`/staff/${id}`, {
      method: 'DELETE'
    });
  }

  // Notifications
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
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

  async getUnreadNotificationCount() {
    const notifications = await this.getNotifications({ unread: true });
    return notifications.length || 0;
  }

  // Add other methods as needed
}

export const api = new ApiClient();
