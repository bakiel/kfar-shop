import { query, isDbAvailable } from '@/lib/db/postgres-client';
import { DriverApplication, DriverApplicationFormData, DriverStatus } from '@/lib/types/driver';
import { promises as fs } from 'fs';
import path from 'path';

const FALLBACK_FILE = path.join(process.cwd(), 'data', 'driver-applications.json');

// Generate application ID
function generateApplicationId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `DRV-${ts}-${rand}`;
}

// Ensure fallback directory exists
async function ensureFallbackDir() {
  const dir = path.dirname(FALLBACK_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // already exists
  }
}

// Read fallback file
async function readFallback(): Promise<DriverApplication[]> {
  try {
    const data = await fs.readFile(FALLBACK_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write fallback file
async function writeFallback(applications: DriverApplication[]) {
  await ensureFallbackDir();
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(applications, null, 2));
}

// Submit a new driver application
export async function submitApplication(
  formData: DriverApplicationFormData
): Promise<{ success: boolean; applicationId: string; error?: string }> {
  const applicationId = generateApplicationId();
  const now = new Date().toISOString();

  const application: DriverApplication = {
    id: applicationId,
    applicationId,
    ...formData,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  // Try DB first
  if (await isDbAvailable()) {
    try {
      await query(
        `INSERT INTO driver_applications
          (id, application_id, full_name, email, phone, id_number, vehicle_type,
           license_number, areas, availability, experience, why_join, status, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          applicationId, applicationId, formData.fullName, formData.email,
          formData.phone, formData.idNumber, formData.vehicleType,
          formData.licenseNumber, JSON.stringify(formData.areas),
          JSON.stringify(formData.availability), formData.experience,
          formData.whyJoin, 'pending', now, now,
        ]
      );
      return { success: true, applicationId };
    } catch (err) {
      console.error('DB insert failed, falling back to JSON:', err);
    }
  }

  // Fallback to JSON file
  try {
    const existing = await readFallback();
    existing.push(application);
    await writeFallback(existing);
    return { success: true, applicationId };
  } catch (err) {
    console.error('JSON fallback failed:', err);
    return { success: false, applicationId: '', error: 'Failed to save application' };
  }
}

// Get all applications with optional status filter
export async function getApplications(
  statusFilter?: DriverStatus
): Promise<DriverApplication[]> {
  // Try DB first
  if (await isDbAvailable()) {
    try {
      let sql = 'SELECT * FROM driver_applications';
      const params: string[] = [];
      if (statusFilter) {
        sql += ' WHERE status = $1';
        params.push(statusFilter);
      }
      sql += ' ORDER BY created_at DESC';
      const { rows } = await query(sql, params);
      return rows.map(mapDbRow);
    } catch (err) {
      console.error('DB query failed, falling back to JSON:', err);
    }
  }

  // Fallback to JSON
  const applications = await readFallback();
  if (statusFilter) {
    return applications.filter(a => a.status === statusFilter);
  }
  return applications.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Update application status
export async function updateApplicationStatus(
  applicationId: string,
  status: DriverStatus,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  // Try DB first
  if (await isDbAvailable()) {
    try {
      await query(
        `UPDATE driver_applications
         SET status = $2, admin_notes = COALESCE($3, admin_notes), updated_at = $4
         WHERE application_id = $1`,
        [applicationId, status, adminNotes || null, now]
      );
      return { success: true };
    } catch (err) {
      console.error('DB update failed, falling back to JSON:', err);
    }
  }

  // Fallback to JSON
  try {
    const applications = await readFallback();
    const idx = applications.findIndex(a => a.applicationId === applicationId);
    if (idx === -1) return { success: false, error: 'Application not found' };
    applications[idx].status = status;
    applications[idx].updatedAt = now;
    if (adminNotes) applications[idx].adminNotes = adminNotes;
    await writeFallback(applications);
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to update application' };
  }
}

// Map DB snake_case row to camelCase
function mapDbRow(row: any): DriverApplication {
  return {
    id: row.id,
    applicationId: row.application_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    idNumber: row.id_number,
    vehicleType: row.vehicle_type,
    licenseNumber: row.license_number,
    areas: typeof row.areas === 'string' ? JSON.parse(row.areas) : row.areas,
    availability: typeof row.availability === 'string' ? JSON.parse(row.availability) : row.availability,
    experience: row.experience,
    whyJoin: row.why_join,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
