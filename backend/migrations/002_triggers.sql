-- T019: Database triggers migration
-- Triggers for RSVP count updates, marking past events, and follower notifications
-- Date: 2026-03-11

-- Trigger to update events.rsvp_count when RSVP is added/removed
CREATE OR REPLACE FUNCTION update_rsvp_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET rsvp_count = rsvp_count - 1 WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_count_trigger
AFTER INSERT OR DELETE ON rsvps
FOR EACH ROW EXECUTE FUNCTION update_rsvp_count();

-- Trigger to mark events as past when event_date passes
CREATE OR REPLACE FUNCTION mark_past_events()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_date < NOW() THEN
    NEW.is_past := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_past_events_trigger
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION mark_past_events();

-- Trigger to create notifications for followers when organizer creates event
CREATE OR REPLACE FUNCTION notify_followers_new_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, event_id, type, message)
  SELECT 
    f.follower_id,
    NEW.id,
    'new_event_from_followed',
    'Organizer ' || u.display_name || ' created a new event: ' || NEW.name
  FROM follows f
  JOIN users u ON u.id = NEW.organizer_id
  WHERE f.followed_id = NEW.organizer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_followers_trigger
AFTER INSERT ON events
FOR EACH ROW EXECUTE FUNCTION notify_followers_new_event();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
