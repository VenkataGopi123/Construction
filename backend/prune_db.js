const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Gopi@localhost:5433/buildpro_db' });

async function prune() {
  try {
    // 1. Drop unused tables and their dependencies via CASCADE
    const dropTables = [
      'crm_leads', 'project_milestones', 'project_updates', 'project_assignments',
      'material_stock_logs', 'project_materials', 'purchase_order_items', 'purchase_orders',
      'attendance', 'payroll', 'workers', 'invoice_items', 'payments', 'invoices', 'quotations',
      'documents', 'notifications', 'reports', 'testimonials', 'contact_submissions', 'chat_messages',
      'warehouses', 'branches', 'suppliers'
    ];
    
    for (const table of dropTables) {
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`Dropped ${table}`);
    }

    // 2. Remove columns from projects that pointed to deleted tables
    await pool.query('ALTER TABLE projects DROP COLUMN IF EXISTS branch_id');
    
    // 3. Remove columns from materials that pointed to deleted tables
    await pool.query('ALTER TABLE materials DROP COLUMN IF EXISTS supplier_id');
    await pool.query('ALTER TABLE materials DROP COLUMN IF EXISTS warehouse_id');

    // 4. Remove columns from users that pointed to deleted tables
    await pool.query('ALTER TABLE users DROP COLUMN IF EXISTS branch_id');

    // 5. Create company_team table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_team (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        image_url TEXT,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Created company_team table');

    console.log('Database pruned successfully!');
  } catch (e) {
    console.error('Error pruning db:', e);
  } finally {
    pool.end();
  }
}
prune();
