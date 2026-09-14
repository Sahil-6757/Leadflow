const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('leadflow_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

export const leadsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/leads${qs}`);
  },
  getById: (id) => request(`/leads/${id}`),
  create: (leadData) => request('/leads', { method: 'POST', body: JSON.stringify(leadData) }),
  update: (id, leadData) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(leadData) }),
  updateStatus: (id, status) => request(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
};

export const followUpsAPI = {
  getAll: () => request('/followups'),
  create: (data) => request('/followups', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/followups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/followups/${id}`, { method: 'DELETE' }),
};

export const activitiesAPI = {
  getAll: (limit = 10) => request(`/activities?limit=${limit}`),
  create: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
};

export const templatesAPI = {
  getAll: () => request('/templates'),
  create: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/templates/${id}`, { method: 'DELETE' }),
};

export const analyticsAPI = {
  getStats: () => request('/analytics/stats'),
};

export const aiAPI = {
  generateMessage: (payload) => request('/ai/generate-message', { method: 'POST', body: JSON.stringify(payload) }),
  chat: (payload) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
};

export const healthAPI = {
  check: () => request('/health'),
};

export const authAPI = {
  login: async (credentials) => {
    const data = await request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem('leadflow_token', data.token);
      localStorage.setItem('leadflow_user', JSON.stringify(data.user));
    }
    return data;
  },
  register: async (userData) => {
    const data = await request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('leadflow_token', data.token);
      localStorage.setItem('leadflow_user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: async () => {
    try {
      await request('/users/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('leadflow_token');
      localStorage.removeItem('leadflow_user');
    }
    return { success: true };
  },
  getMe: () => request('/users/me'),
  getToken: () => localStorage.getItem('leadflow_token'),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('leadflow_user'));
    } catch {
      return null;
    }
  },
  isAuthenticated: () => !!localStorage.getItem('leadflow_token'),
};
