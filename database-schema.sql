-- ---------------
-- TYPE DEFINITIONS
-- ---------------
-- Defines the possible roles for a user in the system.
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'manager');

-- Defines the possible sentiment classifications for a call.
CREATE TYPE call_sentiment AS ENUM ('positive', 'neutral', 'negative');

-- Defines the communication channels for messages.
CREATE TYPE message_channel AS ENUM ('WhatsApp', 'SMS', 'Email');

-- Defines the delivery status of a message.
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');

-- Defines the status of a task.
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');


-- ----------------
-- HELPER FUNCTIONS
-- ----------------
-- This function automatically updates the 'updated_at' timestamp on any row update.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';


-- ---------------
-- TABLE: users
-- ---------------
-- Stores information about internal users of the CRM system.
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'agent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ------------------
-- TABLE: customers
-- ------------------
-- Stores information about customers. The 'tags' array has been replaced by a join table.
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    assigned_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50) UNIQUE,
    company_name VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ------------------
-- TABLES for TAGS (Many-to-Many Relationship with Customers)
-- ------------------
-- Stores all unique tags that can be applied to customers.
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Links customers to tags, creating a many-to-many relationship.
CREATE TABLE customer_tags (
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, tag_id) -- Ensures a customer can't have the same tag twice.
);


-- ---------------
-- TABLE: calls
-- ---------------
-- Stores call records. AI insight fields have been merged into this table.
CREATE TABLE calls (
    call_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    call_time TIMESTAMPTZ NOT NULL,
    call_duration_seconds INTEGER,
    call_recording_path VARCHAR(255),
    transcription_text TEXT,
    summary_text TEXT,
    sentiment call_sentiment,
    embedding_vector JSONB,
    model_used VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_calls_updated_at
BEFORE UPDATE ON calls
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ------------------
-- TABLE: messages
-- ------------------
-- Stores messages sent to or received from customers.
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    channel message_channel NOT NULL,
    message_body TEXT NOT NULL,
    status message_status NOT NULL DEFAULT 'sent',
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ---------------
-- TABLE: tasks
-- ---------------
-- Stores tasks related to customers.
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    status task_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ---------------
-- INDEXES
-- ---------------
-- Indexes to speed up common queries and JOIN operations.

-- On foreign keys
CREATE INDEX idx_customers_assigned_user_id ON customers(assigned_user_id);
CREATE INDEX idx_calls_customer_id ON calls(customer_id);
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_messages_customer_id ON messages(customer_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_customer_tags_customer_id ON customer_tags(customer_id);
CREATE INDEX idx_customer_tags_tag_id ON customer_tags(tag_id);

-- On frequently searched columns
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
