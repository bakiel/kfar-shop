export type DriverStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export type VehicleType = 'car' | 'scooter' | 'bicycle' | 'ebike';

export interface DriverApplication {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  vehicleType: VehicleType;
  licenseNumber: string;
  areas: string[];
  availability: string[];
  experience: string;
  whyJoin: string;
  status: DriverStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  vehicleType: VehicleType;
  licenseNumber: string;
  areas: string[];
  availability: string[];
  experience: string;
  whyJoin: string;
}
