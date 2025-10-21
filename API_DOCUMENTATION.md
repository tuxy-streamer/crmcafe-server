# CRM-Café Server API Documentation

## Overview

This is a comprehensive CRM (Customer Relationship Management) server built with **Bun**, **Fastify**, and **PostgreSQL** (via Supabase). The server provides full CRUD operations for all database entities with advanced features like pagination, filtering, and wildcard search.

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Bun (JavaScript runtime)
- **Framework**: Fastify (high-performance web framework)
- **Database**: PostgreSQL via Supabase
- **Language**: TypeScript
- **Database Client**: postgres.js

### Project Structure
```
src/
├── server.ts              # Main server entry point
├── db.ts                  # Database connection configuration
├── util/
│   ├── log.ts            # Logging configuration
│   └── sql.ts            # SQL utilities (pagination, filtering, updates)
└── routes/
    ├── index.ts          # Welcome route
    ├── health.ts         # Health check route
    ├── register.ts       # Route registration orchestrator
    ├── users.ts          # User CRUD operations
    ├── customers.ts      # Customer CRUD operations
    ├── tags.ts           # Tag CRUD operations
    ├── customer_tags.ts  # Customer-Tag relationship operations
    ├── calls.ts          # Call CRUD operations
    ├── messages.ts       # Message CRUD operations
    └── tasks.ts          # Task CRUD operations
```

## 🗄️ Database Schema

The database includes the following entities:

### Core Tables
- **users**: Internal CRM users (admin, agent, manager roles)
- **customers**: Customer information and assignments
- **tags**: Categorization tags for customers
- **customer_tags**: Many-to-many relationship between customers and tags
- **calls**: Call records with AI insights (transcription, sentiment, embeddings)
- **messages**: Communication messages (WhatsApp, SMS, Email)
- **tasks**: Customer-related tasks with assignments

### Key Features
- **Enums**: User roles, call sentiment, message channels/status, task status
- **Timestamps**: Automatic `created_at` and `updated_at` with triggers
- **Foreign Keys**: Proper relationships with CASCADE/SET NULL policies
- **Indexes**: Optimized for common queries and JOINs

## 🚀 Getting Started

### Prerequisites
- Bun runtime installed
- Supabase project with database schema deployed
- Environment variables configured

### Installation
```bash
# Install dependencies
bun install

# Set environment variables
export DATABASE_URL="postgresql://user:password@host:port/database"
export PGSSLMODE="require"  # For Supabase
```

### Running the Server
```bash
# Development mode (with hot reload)
bun run dev

# Production mode
bun run start

# Type checking
bun run typecheck
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000
```

### Response Format
All list endpoints return paginated responses:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## 🔧 CRUD Operations

### Users (`/users`)

#### GET /users
List all users with pagination and filtering
```bash
GET /users?page=1&limit=10&role=admin&name=*john*
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `role`: Filter by user role (admin, agent, manager)
- `name`: Filter by name (supports wildcards with `*`)

#### GET /users/:id
Get specific user by ID

#### POST /users
Create new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password_hash": "hashed_password",
  "role": "agent"
}
```

#### PATCH /users/:id
Update user (partial updates supported)
```json
{
  "name": "John Smith",
  "role": "manager"
}
```

#### DELETE /users/:id
Delete user

### Customers (`/customers`)

#### GET /customers
List customers with filtering
```bash
GET /customers?page=1&assigned_user_id=5&company_name=*tech*
```

**Query Parameters:**
- Standard pagination: `page`, `limit`
- `assigned_user_id`: Filter by assigned user
- `name`: Customer name (wildcard support)
- `email`: Customer email
- `company_name`: Company name (wildcard support)
- `phone_number`: Phone number

#### POST /customers
Create new customer
```json
{
  "assigned_user_id": 5,
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone_number": "+1234567890",
  "company_name": "Acme Corporation",
  "address": "123 Main St, City, State"
}
```

### Tags (`/tags`)

#### GET /tags
List all tags with pagination
```bash
GET /tags?name=*vip*
```

#### POST /tags
Create new tag
```json
{
  "name": "VIP Customer"
}
```

### Customer Tags (`/customer-tags`)

#### GET /customer-tags
List all customer-tag relationships

#### POST /customer-tags
Associate tag with customer
```json
{
  "customer_id": 10,
  "tag_id": 5
}
```

#### DELETE /customer-tags
Remove tag from customer
```json
{
  "customer_id": 10,
  "tag_id": 5
}
```

### Calls (`/calls`)

#### GET /calls
List calls with filtering
```bash
GET /calls?customer_id=10&sentiment=positive&user_id=5
```

#### POST /calls
Create call record
```json
{
  "customer_id": 10,
  "user_id": 5,
  "call_time": "2024-01-15T10:30:00Z",
  "call_duration_seconds": 1800,
  "call_recording_path": "/recordings/call_123.mp3",
  "transcription_text": "Customer called about billing...",
  "summary_text": "Billing inquiry resolved",
  "sentiment": "positive",
  "embedding_vector": [0.1, 0.2, 0.3],
  "model_used": "gpt-4"
}
```

### Messages (`/messages`)

#### GET /messages
List messages with filtering
```bash
GET /messages?customer_id=10&channel=WhatsApp&status=delivered
```

#### POST /messages
Create message record
```json
{
  "customer_id": 10,
  "user_id": 5,
  "channel": "WhatsApp",
  "message_body": "Thank you for your inquiry",
  "status": "sent",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Tasks (`/tasks`)

#### GET /tasks
List tasks with filtering
```bash
GET /tasks?customer_id=10&status=pending&assigned_to=5
```

#### POST /tasks
Create new task
```json
{
  "customer_id": 10,
  "assigned_to": 5,
  "task_description": "Follow up on billing inquiry",
  "due_date": "2024-01-20T17:00:00Z",
  "status": "pending"
}
```

## 🔍 Advanced Features

### Pagination
All list endpoints support pagination:
- **page**: Page number (1-based)
- **limit**: Items per page (1-100, default: 20)
- **offset**: Direct offset (alternative to page)

### Filtering
Multiple filter types supported:

#### Exact Match
```bash
GET /users?role=admin
GET /customers?assigned_user_id=5
```

#### Wildcard Search
Use `*` for partial matching:
```bash
GET /customers?name=*john*
GET /customers?company_name=*tech*
```

#### Array Filters (IN clause)
```bash
GET /tasks?status=pending,in_progress
GET /users?role=admin,manager
```

### Dynamic Updates
PATCH endpoints support partial updates - only include fields you want to change:
```json
{
  "name": "New Name"
}
```

## 🛠️ Implementation Details

### SQL Utilities (`src/util/sql.ts`)

#### `buildPagination(options)`
- Handles page/limit/offset conversion
- Enforces limits (max 100 items per page)
- Returns `{ limit, offset }`

#### `buildFilters(filters)`
- Converts query parameters to SQL WHERE clauses
- Supports exact match, wildcard (ILIKE), and IN clauses
- Returns `{ whereClause, values }`

#### `buildUpdateSet(data)`
- Creates dynamic SET clauses for PATCH operations
- Filters out undefined values
- Returns `{ setClause, values }`

### Database Connection
- Uses `postgres.js` with connection pooling
- SSL support for Supabase
- Prepared statements for performance

### Error Handling
- 404 for not found resources
- 400 for invalid requests
- Proper HTTP status codes
- Structured error responses

## 🔒 Security Considerations

### Current Implementation
- Input validation on required fields
- SQL injection protection via parameterized queries
- Type safety with TypeScript

### Recommended Additions
- Authentication middleware
- Role-based access control
- Input sanitization
- Rate limiting
- CORS configuration

## 🧪 Testing

### Manual Testing
```bash
# Start server
bun run dev

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/users
curl http://localhost:3000/customers?page=1&limit=5
```

### Database Testing
```bash
# Test database connection
bun run src/db-test.ts
```

## 📈 Performance Features

- **Connection Pooling**: Efficient database connections
- **Prepared Statements**: Faster query execution
- **Indexes**: Optimized database queries
- **Pagination**: Prevents large result sets
- **Selective Updates**: Only update changed fields

## 🚀 Deployment

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
PGSSLMODE=require
PORT=3000
NODE_ENV=production
```

### Production Build
```bash
bun run build
bun run start
```

## 📝 Future Enhancements

1. **Authentication & Authorization**
   - JWT token authentication
   - Role-based permissions
   - User session management

2. **Advanced Filtering**
   - Date range filters
   - Numeric range filters
   - Complex boolean logic

3. **API Documentation**
   - OpenAPI/Swagger integration
   - Interactive API explorer

4. **Monitoring & Logging**
   - Request/response logging
   - Performance metrics
   - Error tracking

5. **Data Validation**
   - JSON Schema validation
   - Input sanitization
   - Business rule validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `bun run typecheck`
5. Test your changes
6. Submit a pull request

## 📄 License

This project is part of the CRM-Café system for BPUT 2025.
