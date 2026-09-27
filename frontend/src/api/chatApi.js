/**
 * REST API client for backend chat endpoints
 */

export const ChatApi = {
  /**
   * Fetch chat history (Mandatory REST API)
   * GET /api/messages
   */
  async getMessages(baseUrl, limit = 100, before = null) {
    try {
      let url = `${baseUrl}/api/messages?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch chat history`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('API Error [getMessages]:', error);
      throw error;
    }
  },

  /**
   * Send a new message via REST API (Mandatory REST API)
   * POST /api/messages
   */
  async sendMessage(baseUrl, { sender, text, recipient = 'all' }) {
    try {
      const response = await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender, text, recipient }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send message`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('API Error [sendMessage]:', error);
      throw error;
    }
  },

  /**
   * Login user / create profile (Bonus REST API)
   * POST /api/login
   */
  async login(baseUrl, username) {
    try {
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}: Login failed`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('API Error [login]:', error);
      throw error;
    }
  },

  /**
   * Fetch online users (Bonus REST API)
   * GET /api/users/online
   */
  async getOnlineUsers(baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/api/users/online`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('API Error [getOnlineUsers]:', error);
      return [];
    }
  },

  /**
   * Check backend health
   * GET /api/health
   */
  async checkHealth(baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },
};
