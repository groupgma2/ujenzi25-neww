-- Seed sample data for the marketplace UI.
-- Safe to run repeatedly because each insert checks for existing titles.

INSERT INTO public.properties (id, owner_id, title, type, location, latitude, longitude, price, size, description, image_url, verified)
SELECT '11111111-1111-4111-8111-111111111111', NULL, 'Modern Villa in Mikocheni', 'villa', 'Mikocheni, Dar es Salaam', -6.7800, 39.2100, 185000000, '360 m²', 'Modern 4-bedroom villa with secure parking, solar backup, and landscaped garden.', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80', true
WHERE NOT EXISTS (SELECT 1 FROM public.properties WHERE title = 'Modern Villa in Mikocheni');

INSERT INTO public.properties (id, owner_id, title, type, location, latitude, longitude, price, size, description, image_url, verified)
SELECT '22222222-2222-4222-8222-222222222222', NULL, 'Contemporary Apartment', 'apartment', 'Kimara, Dar es Salaam', -6.8200, 39.2600, 76000000, '180 m²', 'Spacious apartment close to schools, hospitals, and road access.', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80', true
WHERE NOT EXISTS (SELECT 1 FROM public.properties WHERE title = 'Contemporary Apartment');

INSERT INTO public.properties (id, owner_id, title, type, location, latitude, longitude, price, size, description, image_url, verified)
SELECT '33333333-3333-4333-8333-333333333333', NULL, 'Prime Plot in Kigamboni', 'land', 'Kigamboni, Dar es Salaam', -6.9000, 39.3000, 42000000, '540 m²', 'Prime residential plot with access road and nearby township amenities.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80', false
WHERE NOT EXISTS (SELECT 1 FROM public.properties WHERE title = 'Prime Plot in Kigamboni');

INSERT INTO public.rentals (id, owner_id, title, type, location, bedrooms, bathrooms, rent, image_url, description, verified)
SELECT '44444444-4444-4444-8444-444444444444', NULL, '2-Bedroom Apartment in Mbezi', 'apartment', 'Mbezi Beach, Dar es Salaam', 2, 2, 1400000, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80', 'Comfortable apartment with secure compound, parking, and easy access to local services.', true
WHERE NOT EXISTS (SELECT 1 FROM public.rentals WHERE title = '2-Bedroom Apartment in Mbezi');

INSERT INTO public.rentals (id, owner_id, title, type, location, bedrooms, bathrooms, rent, image_url, description, verified)
SELECT '55555555-5555-4555-8555-555555555555', NULL, '3-Bedroom Family House', 'house', 'Mikocheni, Dar es Salaam', 3, 3, 2100000, 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80', 'Family home with high ceilings, garden area, and close access to supermarkets and schools.', true
WHERE NOT EXISTS (SELECT 1 FROM public.rentals WHERE title = '3-Bedroom Family House');

INSERT INTO public.rentals (id, owner_id, title, type, location, bedrooms, bathrooms, rent, image_url, description, verified)
SELECT '66666666-6666-4666-8666-666666666666', NULL, 'Studio Flat with Balcony', 'studio', 'Upanga, Dar es Salaam', 1, 1, 950000, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80', 'Compact and modern studio with balcony and access to central business areas.', false
WHERE NOT EXISTS (SELECT 1 FROM public.rentals WHERE title = 'Studio Flat with Balcony');

INSERT INTO public.hotels (id, owner_id, name, type, location, price, rating, image_url, description, amenities)
SELECT '77777777-7777-4777-8777-777777777777', NULL, 'Dar Marina Suites', 'hotel', 'Mbezi Beach, Dar es Salaam', 220000, 4.9, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', 'Suites with breakfast, secure parking, and sea-side walking distance.', ARRAY['Free WiFi', 'Pool', 'Breakfast']
WHERE NOT EXISTS (SELECT 1 FROM public.hotels WHERE name = 'Dar Marina Suites');

INSERT INTO public.hotels (id, owner_id, name, type, location, price, rating, image_url, description, amenities)
SELECT '88888888-8888-4888-8888-888888888888', NULL, 'Coastal Airbnb Retreat', 'airbnb', 'Kigamboni, Dar es Salaam', 190000, 4.8, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', 'Modern apartment-style stay with kitchen, terrace, and community access.', ARRAY['Kitchen', 'Parking', 'Sea View']
WHERE NOT EXISTS (SELECT 1 FROM public.hotels WHERE name = 'Coastal Airbnb Retreat');

INSERT INTO public.hotels (id, owner_id, name, type, location, price, rating, image_url, description, amenities)
SELECT '99999999-9999-4999-8999-999999999999', NULL, 'City Suites Lodge', 'apartment', 'Mlimani, Dar es Salaam', 165000, 4.7, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80', 'Comfortable lodge near university and business districts.', ARRAY['WiFi', 'Gym', 'Close to CBD']
WHERE NOT EXISTS (SELECT 1 FROM public.hotels WHERE name = 'City Suites Lodge');
