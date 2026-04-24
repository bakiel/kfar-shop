// Customer Authentication Service
// Non-invasive authentication using phone numbers and QR codes

import React from 'react';

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  qrCode: string;
  avatar?: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  preferences: {
    language: 'en' | 'he' | 'ar';
    currency: 'ILS' | 'USD';
    dietary: string[];
    notifications: boolean;
  };
  addresses: CustomerAddress[];
  joinedAt: Date;
  lastVisit: Date;
}

export interface CustomerAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface LoginResponse {
  success: boolean;
  customer?: CustomerProfile;
  token?: string;
  message?: string;
}

class CustomerAuthService {
  private static instance: CustomerAuthService;
  private currentCustomer: CustomerProfile | null = null;
  private authToken: string | null = null;

  private constructor() {
    // Check for stored auth on initialization
    this.checkStoredAuth();
  }

  static getInstance(): CustomerAuthService {
    if (!CustomerAuthService.instance) {
      CustomerAuthService.instance = new CustomerAuthService();
    }
    return CustomerAuthService.instance;
  }

  // Check for stored authentication
  private checkStoredAuth() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('kfar_customer_token');
      const storedCustomer = localStorage.getItem('kfar_customer_profile');
      
      if (storedToken && storedCustomer) {
        try {
          this.authToken = storedToken;
          this.currentCustomer = JSON.parse(storedCustomer);
        } catch (error) {
          this.clearAuth();
        }
      }
    }
  }

  // Phone number login
  async loginWithPhone(phoneNumber: string): Promise<LoginResponse> {
    try {
      // Normalize phone number
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

      // Call the auth API to look up customer by phone
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: 'Login failed. Please check your phone number and try again.'
        };
      }

      const data = await response.json();

      if (data.customer && data.token) {
        this.setAuth(data.customer, data.token);
        return {
          success: true,
          customer: data.customer,
          token: data.token
        };
      }

      return {
        success: false,
        message: data.message || 'Customer not found. Please register first.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  // QR code login
  async loginWithQR(qrData: string): Promise<LoginResponse> {
    try {
      if (!qrData || !qrData.startsWith('KFAR-')) {
        return {
          success: false,
          message: 'Invalid QR code'
        };
      }

      // Validate QR with backend
      const response = await fetch('/api/auth/qr-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrData }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: 'QR code validation failed'
        };
      }

      const data = await response.json();

      if (data.customer && data.token) {
        this.setAuth(data.customer, data.token);
        return {
          success: true,
          customer: data.customer,
          token: data.token
        };
      }

      return {
        success: false,
        message: data.message || 'Invalid QR code'
      };
    } catch (error) {
      return {
        success: false,
        message: 'QR code scanning failed'
      };
    }
  }

  // Quick registration
  async quickRegister(phoneNumber: string, name?: string): Promise<LoginResponse> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          name: name || 'Guest User',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Registration failed'
        };
      }

      const data = await response.json();

      if (data.customer && data.token) {
        this.setAuth(data.customer, data.token);
        return {
          success: true,
          customer: data.customer,
          token: data.token,
          message: data.message || 'Welcome to KFAR!'
        };
      }

      return {
        success: false,
        message: data.message || 'Registration failed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed'
      };
    }
  }

  // Set authentication
  private setAuth(customer: CustomerProfile, token: string) {
    this.currentCustomer = customer;
    this.authToken = token;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('kfar_customer_token', token);
      localStorage.setItem('kfar_customer_profile', JSON.stringify(customer));
    }
  }

  // Clear authentication
  clearAuth() {
    this.currentCustomer = null;
    this.authToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kfar_customer_token');
      localStorage.removeItem('kfar_customer_profile');
    }
  }

  // Get current customer
  getCurrentCustomer(): CustomerProfile | null {
    return this.currentCustomer;
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.currentCustomer && !!this.authToken;
  }

  // Update customer points
  async addPoints(points: number, reason: string): Promise<void> {
    if (this.currentCustomer) {
      this.currentCustomer.points += points;
      
      // Check for tier upgrade
      this.checkTierUpgrade();
      
      // Update stored profile
      if (typeof window !== 'undefined') {
        localStorage.setItem('kfar_customer_profile', JSON.stringify(this.currentCustomer));
      }
    }
  }

  // Check tier upgrade
  private checkTierUpgrade() {
    if (!this.currentCustomer) return;
    
    const points = this.currentCustomer.points;
    let newTier: CustomerProfile['tier'] = 'Bronze';
    
    if (points >= 5000) {
      newTier = 'Platinum';
    } else if (points >= 2500) {
      newTier = 'Gold';
    } else if (points >= 1000) {
      newTier = 'Silver';
    }
    
    if (newTier !== this.currentCustomer.tier) {
      this.currentCustomer.tier = newTier;
      // In production, notify customer of tier upgrade
    }
  }

  // Normalize phone number
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digits
    let normalized = phone.replace(/\D/g, '');
    
    // Handle Israeli phone numbers
    if (normalized.startsWith('972')) {
      normalized = '0' + normalized.substring(3);
    }
    
    // Ensure it starts with 0
    if (!normalized.startsWith('0')) {
      normalized = '0' + normalized;
    }
    
    return normalized;
  }

  // Parse QR code -- validates format only, actual lookup done by backend
  private parseQRCode(qrData: string): string | null {
    try {
      // QR format: KFAR-PHONE-TIMESTAMP-DATA
      if (!qrData.startsWith('KFAR-')) {
        return null;
      }
      return qrData;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const customerAuth = CustomerAuthService.getInstance();

// Hook for React components
export function useCustomerAuth() {
  const [customer, setCustomer] = React.useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const auth = CustomerAuthService.getInstance();
    setCustomer(auth.getCurrentCustomer());
    setIsLoading(false);
  }, []);

  return {
    customer,
    isLoading,
    isAuthenticated: !!customer,
    login: customerAuth.loginWithPhone.bind(customerAuth),
    loginWithQR: customerAuth.loginWithQR.bind(customerAuth),
    logout: customerAuth.clearAuth.bind(customerAuth),
    quickRegister: customerAuth.quickRegister.bind(customerAuth)
  };
}
