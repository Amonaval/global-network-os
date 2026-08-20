ALTER TABLE network_settings
  ADD COLUMN IF NOT EXISTS entity_label       text NOT NULL DEFAULT 'Member',
  ADD COLUMN IF NOT EXISTS entity_label_plural text NOT NULL DEFAULT 'Members',
  ADD COLUMN IF NOT EXISTS level_label        text NOT NULL DEFAULT 'Generation',
  ADD COLUMN IF NOT EXISTS level_label_plural text NOT NULL DEFAULT 'Generations',
  ADD COLUMN IF NOT EXISTS parent_label       text NOT NULL DEFAULT 'Parent',
  ADD COLUMN IF NOT EXISTS child_label        text NOT NULL DEFAULT 'Child',
  ADD COLUMN IF NOT EXISTS peer_label         text NOT NULL DEFAULT 'Spouse',
  ADD COLUMN IF NOT EXISTS network_template   text NOT NULL DEFAULT 'family';
