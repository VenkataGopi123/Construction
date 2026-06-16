-- BuildMaster ERP - Simplified Seed Data

-- Admin User: admin@harshithram.com / admin123
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, is_verified) VALUES
('c1000000-0000-0000-0000-000000000001', 'admin@harshithram.com', '$2b$12$8K8vQ8vQ8vQ8vQ8vQ8vQ8uK8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8v', 'Admin', 'User', '+91-9000000000', 'admin', true, true);

INSERT INTO materials (sku, name, category, unit, quantity, min_stock_level, cost_price, selling_price, description) VALUES
('CEM-OPC-50', 'OPC Cement 50kg', 'Cement', 'bag', 500, 100, 380.00, 420.00, 'Portland cement for general construction'),
('SND-MS-01', 'M-Sand Grade 1', 'Sand', 'ton', 200, 50, 1200.00, 1450.00, 'High quality manufactured sand'),
('STL-TMT-12', 'TMT Bar 12mm', 'Iron Rods', 'ton', 80, 20, 65000.00, 72000.00, 'High strength TMT rebars'),
('BRK-RED-01', 'Red Clay Bricks', 'Bricks', '1000 pcs', 150, 30, 5500.00, 6200.00, 'Standard red clay bricks'),
('TIL-VIT-2X2', 'Vitrified Tiles 2x2', 'Tiles', 'sqft', 5000, 500, 45.00, 65.00, 'Premium floor tiles');

INSERT INTO projects (project_code, name, project_type, client_name, budget, start_date, end_date, location, status, progress_percent, description) VALUES
('PRJ-2024-001', 'Skyline Residency Phase 1', 'residential', 'Vikram Singh', 85000000.00, '2024-01-15', '2025-06-30', 'Andheri West, Mumbai', 'in_progress', 65, 'Luxury residential apartments'),
('PRJ-2024-002', 'Metro Commercial Complex', 'commercial', 'Metro Developers Ltd', 250000000.00, '2024-03-01', '2026-12-31', 'Bandra Kurla Complex, Mumbai', 'in_progress', 35, 'Multi-story commercial office space'),
('PRJ-2023-015', 'NH-48 Highway Extension', 'road', 'NHAI', 120000000.00, '2023-06-01', '2024-05-31', 'Pune-Nashik Highway', 'completed', 100, 'Highway widening and extension project');

INSERT INTO services (name, description, category, base_price, is_active) VALUES
('Architectural Design', 'Comprehensive architectural design and planning services for residential and commercial buildings.', 'Design', 50000.00, true),
('Structural Engineering', 'Expert structural analysis and engineering design ensuring safety and durability.', 'Engineering', 75000.00, true),
('Interior Design', 'Creative and functional interior design solutions for modern living spaces.', 'Design', 40000.00, true),
('General Contracting', 'Full-service construction and project management from foundation to finish.', 'Construction', 0.00, true);
