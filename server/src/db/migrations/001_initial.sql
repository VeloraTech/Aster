CREATE TABLE technologies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  type TEXT NOT NULL CHECK (type IN (
    'Programming language', 'Framework', 'Runtime', 'Database',
    'Container tool', 'Container platform', 'Build tool', 'Testing tool', 'Library'
  )),
  category TEXT NOT NULL CHECK (category IN (
    'Languages', 'Frameworks', 'Libraries', 'Databases', 'Runtimes',
    'Infrastructure', 'DevOps', 'Build Tools', 'Testing'
  )),
  ecosystem TEXT,
  logo TEXT,
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX technologies_category_idx ON technologies(category);
CREATE INDEX technologies_type_idx ON technologies(type);
CREATE INDEX technologies_ecosystem_idx ON technologies(ecosystem);
CREATE TABLE technology_use_cases (
  technology_id TEXT NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 0),
  use_case TEXT NOT NULL CHECK (length(trim(use_case)) > 0),
  PRIMARY KEY (technology_id, position),
  UNIQUE (technology_id, use_case)
);

CREATE TABLE technology_resources (
  technology_id TEXT NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 0),
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  url TEXT NOT NULL CHECK (url ~ '^https?://'),
  type TEXT NOT NULL CHECK (type IN ('Official website', 'Documentation', 'Source code')),
  PRIMARY KEY (technology_id, position),
  UNIQUE (technology_id, url)
);

CREATE TABLE technology_relationships (
  source_technology_id TEXT NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'alternative_to', 'commonly_used_with', 'built_on', 'part_of', 'related_to'
  )),
  target_technology_id TEXT NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (source_technology_id, relationship_type, target_technology_id),
  CHECK (source_technology_id <> target_technology_id)
);

CREATE INDEX technology_relationships_target_idx ON technology_relationships(target_technology_id);
CREATE UNIQUE INDEX technology_relationships_symmetric_unique_idx
  ON technology_relationships (
    relationship_type,
    LEAST(source_technology_id, target_technology_id),
    GREATEST(source_technology_id, target_technology_id)
  )
  WHERE relationship_type IN ('alternative_to', 'commonly_used_with', 'related_to');
