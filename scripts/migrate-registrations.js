require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Paths to check for registration data
const possiblePaths = [
  '/Users/mac/Downloads/kfar-final/deploy-coming-soon-1/form-data',
  '/Users/mac/Downloads/kfar-final/deploy-coming-soon/form-data',
  '/Users/mac/Downloads/kfar-final/kfar-landing-update/form-data',
  '/Users/mac/Downloads/kfar-final/form-data'
];

async function findRegistrationFiles() {
  const allFiles = [];
  
  for (const dirPath of possiblePaths) {
    try {
      const files = await fs.readdir(dirPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of jsonFiles) {
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        allFiles.push({ path: filePath, data });
      }
      
      console.log(`Found ${jsonFiles.length} files in ${dirPath}`);
    } catch (err) {
      console.log(`Directory not found or inaccessible: ${dirPath}`);
    }
  }
  
  return allFiles;
}

async function migrateRegistrations() {
  console.log('🚀 Starting registration migration to Supabase...\n');
  
  try {
    // Find all registration files
    const files = await findRegistrationFiles();
    console.log(`\nTotal files found: ${files.length}`);
    
    if (files.length === 0) {
      console.log('No registration files found. Exiting.');
      return;
    }
    
    // Separate customer and vendor registrations
    const customerRegs = [];
    const vendorRegs = [];
    
    for (const { path: filePath, data } of files) {
      if (data.type === 'customer' || data.type === 'customer-waitlist') {
        customerRegs.push({
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp || data.phone || null,
          source: data.source || 'website',
          status: 'active',
          created_at: data.timestamp || new Date().toISOString()
        });
      } else if (data.type === 'vendor' || data.type === 'vendor-application') {
        vendorRegs.push({
          first_name: data.firstName || data.first_name || data.name?.split(' ')[0] || '',
          last_name: data.lastName || data.last_name || data.name?.split(' ').slice(1).join(' ') || '',
          business_name: data.businessName || data.business_name || '',
          email: data.email,
          phone: data.phone || data.whatsapp || null,
          location: data.location || null,
          business_type: data.businessType || data.business_type || null,
          message: data.message || null,
          status: 'pending',
          source: data.source || 'website',
          created_at: data.timestamp || new Date().toISOString()
        });
      }
    }
    
    console.log(`\nFound ${customerRegs.length} customer registrations`);
    console.log(`Found ${vendorRegs.length} vendor registrations`);
    
    // Migrate customer registrations
    if (customerRegs.length > 0) {
      console.log('\n📥 Migrating customer registrations...');
      
      // Remove duplicates based on email
      const uniqueCustomers = customerRegs.reduce((acc, curr) => {
        if (!acc.find(c => c.email === curr.email)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      const { data, error } = await supabase
        .from('customer_registrations')
        .insert(uniqueCustomers);
      
      if (error) {
        console.error('Error migrating customers:', error);
      } else {
        console.log(`✅ Successfully migrated ${uniqueCustomers.length} unique customer registrations`);
      }
    }
    
    // Migrate vendor registrations
    if (vendorRegs.length > 0) {
      console.log('\n📥 Migrating vendor registrations...');
      
      // Remove duplicates based on email
      const uniqueVendors = vendorRegs.reduce((acc, curr) => {
        if (!acc.find(v => v.email === curr.email)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      const { data, error } = await supabase
        .from('vendor_registrations')
        .insert(uniqueVendors);
      
      if (error) {
        console.error('Error migrating vendors:', error);
      } else {
        console.log(`✅ Successfully migrated ${uniqueVendors.length} unique vendor registrations`);
      }
    }
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    
    const { count: customerCount } = await supabase
      .from('customer_registrations')
      .select('*', { count: 'exact', head: true });
    
    const { count: vendorCount } = await supabase
      .from('vendor_registrations')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Migration Complete!`);
    console.log(`Total customers in database: ${customerCount}`);
    console.log(`Total vendors in database: ${vendorCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateRegistrations();