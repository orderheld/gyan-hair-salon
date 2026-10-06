-- Startdaten. Werden nur eingefügt, wenn noch nichts vorhanden ist.
-- Preise und Dauer sind PLATZHALTER: bitte im Admin-Panel anpassen.

INSERT INTO services (name, description, duration_min, price_chf, price_from, sort)
SELECT * FROM (VALUES
  ('Haarschnitt', 'Beratung, Schnitt mit Schere und Maschine, Styling.', 30, 40.00, false, 10),
  ('Skin Fade', 'Präziser Übergang bis auf die Haut, sauber konturiert.', 45, 45.00, false, 20),
  ('Haarschnitt & Bart', 'Der komplette Look: Schnitt, Bartform und Konturen.', 60, 65.00, false, 30),
  ('Bart trimmen & formen', 'Bart in Form gebracht, Konturen mit der Klinge.', 30, 30.00, false, 40),
  ('Klassische Rasur', 'Nassrasur mit heissem Tuch und Pflege.', 30, 35.00, false, 50),
  ('Kinderhaarschnitt', 'Für Kinder bis 12 Jahre.', 30, 30.00, false, 60),
  ('GYAN Signature', 'Ausführliche Beratung, Haarwäsche, Schnitt, Bart, heisses Tuch und Styling. Die volle Zeit mit Zana.', 75, 95.00, false, 70)
) AS v(name, description, duration_min, price_chf, price_from, sort)
WHERE NOT EXISTS (SELECT 1 FROM services);

INSERT INTO opening_hours (weekday, is_open, open_time, close_time) VALUES
  (1, true,  '09:00', '19:00'),
  (2, true,  '09:00', '19:00'),
  (3, true,  '09:00', '19:00'),
  (4, true,  '09:00', '20:00'),
  (5, true,  '09:00', '20:00'),
  (6, true,  '08:30', '18:00'),
  (0, false, '09:00', '18:00')
ON CONFLICT (weekday) DO NOTHING;
