-- +goose Up

-- 1. General system settings table for app-wide configurations
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- Seed update schedule config
INSERT INTO system_settings (key, value, description)
VALUES (
  'update_schedule_config',
  '{
    "target_updates_count": 20,
    "start_time": "07:00",
    "end_time": "17:00",
    "interval_minutes": 30
  }'::jsonb,
  'Configuration for election update schedule including target updates count, start time (HH:MM), end time (HH:MM), and interval in minutes'
)
ON CONFLICT (key) DO NOTHING;

-- +goose Down
DROP TABLE IF EXISTS system_settings;