-- BuildMaster ERP - Seed Data

INSERT INTO branches (id, name, code, address, city, state, pincode, phone, email) VALUES
('a1000000-0000-0000-0000-000000000001', 'Head Office', 'HO-001', '123 Construction Avenue', 'Mumbai', 'Maharashtra', '400001', '+91-9876543210', 'hq@buildmaster.com'),
('a1000000-0000-0000-0000-000000000002', 'Delhi Branch', 'DL-001', '456 Builder Street', 'New Delhi', 'Delhi', '110001', '+91-9876543211', 'delhi@buildmaster.com');

INSERT INTO warehouses (id, branch_id, name, code, address, capacity_sqft) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Mumbai Central Warehouse', 'WH-MUM-01', 'Industrial Area, Andheri', 50000),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Delhi North Warehouse', 'WH-DEL-01', 'Okhla Industrial Area', 35000);

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, branch_id, is_verified) VALUES
('c1000000-0000-0000-0000-000000000001', 'admin@buildmaster.com', '$2b$12$8K8vQ8vQ8vQ8vQ8vQ8vQ8uK8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8v', 'Super', 'Admin', '+91-9000000001', 'super_admin', 'a1000000-0000-0000-0000-000000000001', true),
('c1000000-0000-0000-0000-000000000002', 'pm@buildmaster.com', '$2b$12$8K8vQ8vQ8vQ8vQ8vQ8vQ8uK8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8v', 'Rajesh', 'Kumar', '+91-9000000002', 'project_manager', 'a1000000-0000-0000-0000-000000000001', true),
('c1000000-0000-0000-0000-000000000003', 'material@buildmaster.com', '$2b$12$8K8vQ8vQ8vQ8vQ8vQ8vQ8uK8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8v', 'Priya', 'Sharma', '+91-9000000003', 'material_manager', 'a1000000-0000-0000-0000-000000000001', true),
('c1000000-0000-0000-0000-000000000004', 'supplier@buildmaster.com', '$2b$12$8K8vQ8vQ8vQ8vQ8vQ8vQ8uK8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8v', 'Amit', 'Patel', '+91-9000000004', 'supplier', NULL, true),
('c1000000-0000-0000-0000-000000000005', 'customer@buildmaster.com', '$2b$12$8K8vQ8vQ8vQ8vQ8vQ8vQ8uK8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8v', 'Vikram', 'Singh', '+91-9000000005', 'customer', NULL, true);

INSERT INTO material_categories (id, name, description) VALUES
('d1000000-0000-0000-0000-000000000001', 'Cement', 'Portland and blended cement'),
('d1000000-0000-0000-0000-000000000002', 'Sand', 'River sand and M-sand'),
('d1000000-0000-0000-0000-000000000003', 'Iron Rods', 'TMT bars and steel rods'),
('d1000000-0000-0000-0000-000000000004', 'Bricks', 'Clay and fly ash bricks'),
('d1000000-0000-0000-0000-000000000005', 'Pillars', 'Precast concrete pillars'),
('d1000000-0000-0000-0000-000000000006', 'Concrete Blocks', 'AAC and solid blocks'),
('d1000000-0000-0000-0000-000000000007', 'Paint', 'Interior and exterior paints'),
('d1000000-0000-0000-0000-000000000008', 'Tiles', 'Floor and wall tiles'),
('d1000000-0000-0000-0000-000000000009', 'Electrical Materials', 'Wires, switches, fixtures'),
('d1000000-0000-0000-0000-00000000000a', 'Plumbing Materials', 'Pipes, fittings, fixtures');

INSERT INTO suppliers (id, supplier_code, user_id, company_name, contact_person, email, phone, gst_number, material_categories, rating) VALUES
('e1000000-0000-0000-0000-000000000001', 'SUP-001', 'c1000000-0000-0000-0000-000000000004', 'Patel Building Materials', 'Amit Patel', 'supplier@buildmaster.com', '+91-9000000004', '27AABCP1234F1Z5', ARRAY['Cement','Sand','Bricks'], 4.5);

INSERT INTO customers (id, customer_code, user_id, name, email, phone, address, city, pan) VALUES
('f1000000-0000-0000-0000-000000000001', 'CUS-001', 'c1000000-0000-0000-0000-000000000005', 'Vikram Singh', 'customer@buildmaster.com', '+91-9000000005', '789 Residential Colony', 'Mumbai', 'ABCDE1234F');

INSERT INTO materials (sku, name, category_id, unit, quantity, min_stock_level, cost_price, selling_price, supplier_id, warehouse_id, barcode) VALUES
('CEM-OPC-50', 'OPC Cement 50kg', 'd1000000-0000-0000-0000-000000000001', 'bag', 500, 100, 380.00, 420.00, 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '8901234567890'),
('SND-MS-01', 'M-Sand Grade 1', 'd1000000-0000-0000-0000-000000000002', 'ton', 200, 50, 1200.00, 1450.00, 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '8901234567891'),
('STL-TMT-12', 'TMT Bar 12mm', 'd1000000-0000-0000-0000-000000000003', 'ton', 80, 20, 65000.00, 72000.00, 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '8901234567892'),
('BRK-RED-01', 'Red Clay Bricks', 'd1000000-0000-0000-0000-000000000004', '1000 pcs', 150, 30, 5500.00, 6200.00, 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '8901234567893'),
('PNT-EMUL-20', 'Emulsion Paint 20L', 'd1000000-0000-0000-0000-000000000007', 'can', 45, 10, 2800.00, 3200.00, 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '8901234567894'),
('TIL-VIT-2X2', 'Vitrified Tiles 2x2', 'd1000000-0000-0000-0000-000000000008', 'sqft', 5000, 500, 45.00, 65.00, 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '8901234567895');

INSERT INTO projects (id, project_code, name, project_type, customer_id, client_name, budget, start_date, end_date, location, latitude, longitude, status, progress_percent, branch_id, manager_id) VALUES
('e9000000-0000-0000-0000-000000000001', 'PRJ-2024-001', 'Skyline Residency Phase 1', 'residential', 'f1000000-0000-0000-0000-000000000001', 'Vikram Singh', 85000000.00, '2024-01-15', '2025-06-30', 'Andheri West, Mumbai', 19.1364, 72.8296, 'in_progress', 65, 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'),
('e9000000-0000-0000-0000-000000000002', 'PRJ-2024-002', 'Metro Commercial Complex', 'commercial', NULL, 'Metro Developers Ltd', 250000000.00, '2024-03-01', '2026-12-31', 'Bandra Kurla Complex, Mumbai', 19.0596, 72.8656, 'in_progress', 35, 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'),
('e9000000-0000-0000-0000-000000000003', 'PRJ-2023-015', 'NH-48 Highway Extension', 'road', NULL, 'NHAI', 120000000.00, '2023-06-01', '2024-05-31', 'Pune-Nashik Highway', 18.5204, 73.8567, 'completed', 100, 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002');

INSERT INTO workers (id, employee_id, first_name, last_name, phone, skill, daily_wage, monthly_salary, branch_id) VALUES
('e8000000-0000-0000-0000-000000000001', 'EMP-001', 'Ramesh', 'Yadav', '+91-9100000001', 'mason', 800.00, 22000.00, 'a1000000-0000-0000-0000-000000000001'),
('e8000000-0000-0000-0000-000000000002', 'EMP-002', 'Suresh', 'Verma', '+91-9100000002', 'electrician', 900.00, 25000.00, 'a1000000-0000-0000-0000-000000000001'),
('e8000000-0000-0000-0000-000000000003', 'EMP-003', 'Anil', 'Gupta', '+91-9100000003', 'engineer', 0.00, 55000.00, 'a1000000-0000-0000-0000-000000000001');

INSERT INTO testimonials (client_name, company, content, rating, project_type, is_featured) VALUES
('Vikram Singh', 'Individual Homeowner', 'BuildMaster delivered our dream home on time with exceptional quality.', 5, 'residential', true),
('Metro Developers Ltd', 'Metro Developers', 'Professional team, transparent billing, and excellent material quality.', 5, 'commercial', true),
('NHAI', 'National Highways Authority', 'Completed the highway extension project ahead of schedule.', 5, 'road', true);
