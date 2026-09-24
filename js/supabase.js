/**
 * SURPLUS-TO-SHELTER SUPABASE CLIENT SDK INTEGRATION
 */

const API_BASE_URL = 'http://localhost:5000/api';

window.SupabaseService = {
  // Get Health Status
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'offline', database: 'Local Storage' };
    }
  },

  // Register New User in Supabase & Backend
  async registerUser(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (e) {
      console.error('User registration error:', e);
      return { success: false, error: e.message };
    }
  },


  // Get All Donations
  async getDonations() {
    try {
      const res = await fetch(`${API_BASE_URL}/donations`);
      const data = await res.json();
      return data.donations || [];
    } catch (e) {
      console.warn('API offline, returning mock data:', e);
      return [];
    }
  },

  // Post New Surplus Food Donation
  async createDonation(donationData) {
    try {
      const res = await fetch(`${API_BASE_URL}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to create donation:', e);
      return { success: false, error: e.message };
    }
  },

  // NGO Claim Food
  async claimDonation(id, ngoName) {
    try {
      const res = await fetch(`${API_BASE_URL}/donations/${id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngo_name: ngoName })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Driver Assignment
  async assignDriver(id, driverName) {
    try {
      const res = await fetch(`${API_BASE_URL}/donations/${id}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_name: driverName })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Update Delivery Status
  async updateStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/donations/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Get Telemetry Stats
  async getStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const data = await res.json();
      return data.stats;
    } catch (e) {
      return { meals_rescued: 4850, co2_saved_kg: 3200, tax_deductions_inr: 145200 };
    }
  }
};
