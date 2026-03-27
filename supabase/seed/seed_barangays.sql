-- Barangay reference seed for Dasmariñas City CHO II (32 barangays)
-- Source: supabase/seed/gis/cho2-boundaries.geojson
-- Centroids pre-computed from MultiPolygon boundaries (shapely centroid)
-- Generated: 2026-03-27
-- Note: geom will be upgraded to full MultiPolygon boundaries in Phase 4 (Map module)
-- Idempotent: ON CONFLICT (pcode) DO NOTHING

BEGIN;

INSERT INTO public.barangays (name, pcode, geom) VALUES
('Emmanuel Bergado I', 'PH0402106021', ST_SetSRID(ST_MakePoint(120.95929951, 14.31589461), 4326)),
('Fatima I', 'PH0402106022', ST_SetSRID(ST_MakePoint(120.96178043, 14.31864478), 4326)),
('Luzviminda I', 'PH0402106023', ST_SetSRID(ST_MakePoint(120.96635983, 14.31516551), 4326)),
('San Andres I', 'PH0402106025', ST_SetSRID(ST_MakePoint(120.96946480, 14.32037757), 4326)),
('San Antonio de Padua I', 'PH0402106026', ST_SetSRID(ST_MakePoint(120.95784150, 14.31913484), 4326)),
('San Francisco I', 'PH0402106029', ST_SetSRID(ST_MakePoint(120.96657815, 14.31981116), 4326)),
('San Lorenzo Ruiz I', 'PH0402106032', ST_SetSRID(ST_MakePoint(120.95973322, 14.31104366), 4326)),
('San Luis I', 'PH0402106033', ST_SetSRID(ST_MakePoint(120.96337318, 14.31099123), 4326)),
('San Mateo', 'PH0402106035', ST_SetSRID(ST_MakePoint(120.96841004, 14.31702272), 4326)),
('San Nicolas I', 'PH0402106037', ST_SetSRID(ST_MakePoint(120.96914567, 14.31515899), 4326)),
('San Roque (Sta. Cristina II)', 'PH0402106038', ST_SetSRID(ST_MakePoint(120.96816113, 14.32334052), 4326)),
('San Simon (Barangay 7)', 'PH0402106039', ST_SetSRID(ST_MakePoint(120.97170444, 14.31979444), 4326)),
('Santa Cristina I', 'PH0402106040', ST_SetSRID(ST_MakePoint(120.96975959, 14.32318183), 4326)),
('Santa Cruz I', 'PH0402106041', ST_SetSRID(ST_MakePoint(120.95886205, 14.31314260), 4326)),
('Santa Fe', 'PH0402106042', ST_SetSRID(ST_MakePoint(120.96474057, 14.31976999), 4326)),
('Santa Maria (Barangay 20)', 'PH0402106044', ST_SetSRID(ST_MakePoint(120.95685335, 14.32228425), 4326)),
('Burol I', 'PH0402106047', ST_SetSRID(ST_MakePoint(120.96199894, 14.33061114), 4326)),
('Burol II', 'PH0402106048', ST_SetSRID(ST_MakePoint(120.96165179, 14.32300586), 4326)),
('Burol III', 'PH0402106049', ST_SetSRID(ST_MakePoint(120.96929474, 14.32959723), 4326)),
('Emmanuel Bergado II', 'PH0402106050', ST_SetSRID(ST_MakePoint(120.96104629, 14.31502226), 4326)),
('Fatima II', 'PH0402106051', ST_SetSRID(ST_MakePoint(120.96400549, 14.31553970), 4326)),
('Fatima III', 'PH0402106052', ST_SetSRID(ST_MakePoint(120.96530784, 14.31238341), 4326)),
('Luzviminda II', 'PH0402106054', ST_SetSRID(ST_MakePoint(120.96950935, 14.30958430), 4326)),
('San Andres II', 'PH0402106067', ST_SetSRID(ST_MakePoint(120.96749125, 14.32189577), 4326)),
('San Antonio de Padua II', 'PH0402106068', ST_SetSRID(ST_MakePoint(120.95733250, 14.31722533), 4326)),
('San Francisco II', 'PH0402106069', ST_SetSRID(ST_MakePoint(120.96700372, 14.32035387), 4326)),
('San Lorenzo Ruiz II', 'PH0402106071', ST_SetSRID(ST_MakePoint(120.95706352, 14.31120257), 4326)),
('San Luis II', 'PH0402106072', ST_SetSRID(ST_MakePoint(120.96261243, 14.31364613), 4326)),
('San Nicolas II', 'PH0402106075', ST_SetSRID(ST_MakePoint(120.97240651, 14.31636807), 4326)),
('Santa Cristina II', 'PH0402106076', ST_SetSRID(ST_MakePoint(120.96665015, 14.32390169), 4326)),
('Santa Cruz II', 'PH0402106077', ST_SetSRID(ST_MakePoint(120.95689223, 14.31542484), 4326)),
('Victoria Reyes', 'PH0402106081', ST_SetSRID(ST_MakePoint(120.97658933, 14.31665794), 4326))
ON CONFLICT (pcode) DO NOTHING;

COMMIT;
