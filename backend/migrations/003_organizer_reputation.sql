-- T020: Organizer reputation materialized view
-- Calculates organizer reputation scores based on past event attendance
-- Date: 2026-03-11

CREATE MATERIALIZED VIEW organizer_reputation AS
SELECT 
  u.id AS organizer_id,
  u.display_name,
  COUNT(DISTINCT e.id) AS total_events,
  COALESCE(AVG(e.rsvp_count), 0) AS avg_attendance,
  COALESCE(SUM(e.rsvp_count), 0) AS total_attendance,
  COALESCE(SUM(e.rsvp_count) / GREATEST(COUNT(DISTINCT e.id), 1), 0)::DECIMAL AS reputation_score
FROM users u
LEFT JOIN events e ON e.organizer_id = u.id AND e.is_past = TRUE
GROUP BY u.id, u.display_name;

CREATE UNIQUE INDEX idx_organizer_reputation_id ON organizer_reputation(organizer_id);

-- Function to refresh organizer reputation view
CREATE OR REPLACE FUNCTION refresh_organizer_reputation()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY organizer_reputation;
END;
$$ LANGUAGE plpgsql;
