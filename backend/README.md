# Glass Finance Backend API

Backend API for Glass Finance - Tu secretaria financiera personal

## Tech Stack

- **FastAPI**: Modern Python web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Relational database
- **Pydantic**: Data validation using Python type annotations
- **Belvo**: Banking API for accessing financial data
- **JWT**: JSON Web Tokens for authentication
- **Alembic**: Database migration tool
- **Celery**: Distributed task queue (for background jobs)
- **Redis**: In-memory data store (caching and Celery broker)

## Features

- User authentication (register, login, token refresh)
- Bank account integration via Belvo
- Credit card management
- Transaction tracking and analysis
- Suspicious charge detection
- Subscription detection and management
- Automation rules for payments
- Real-time alerts and notifications

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Redis 7+

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- Database URL
- Belvo API credentials
- JWT secret key
- Redis URL

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb glass_finance
```

2. Run migrations:
```bash
alembic upgrade head
```

Or generate a new migration after model changes:
```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## Running the Application

### Development

Start the development server with auto-reload:
```bash
python -m app.main
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production

Using Gunicorn with Uvicorn workers:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### API Documentation

Once running, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Users (Coming Soon)
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user profile

### Bank Accounts (Coming Soon)
- `GET /api/v1/accounts` - List all accounts
- `POST /api/v1/accounts` - Create account manually
- `GET /api/v1/accounts/{id}` - Get account details

### Credit Cards (Coming Soon)
- `GET /api/v1/cards` - List all credit cards
- `POST /api/v1/cards` - Add credit card manually

### Transactions (Coming Soon)
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/transactions/analytics` - Get transaction analytics

### Belvo Integration (Coming Soon)
- `POST /api/v1/belvo/link` - Connect bank via Belvo
- `POST /api/v1/belvo/sync` - Sync accounts and transactions

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   ├── versions/         # Migration files
│   └── env.py           # Alembic environment
├── app/
│   ├── api/
│   │   ├── endpoints/   # API endpoints
│   │   ├── dependencies.py
│   │   └── router.py
│   ├── core/
│   │   ├── config.py    # Configuration
│   │   └── security.py  # Security utilities
│   ├── db/
│   │   └── base.py      # Database setup
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── main.py          # FastAPI application
├── .env.example         # Environment variables template
├── alembic.ini          # Alembic configuration
├── requirements.txt     # Python dependencies
└── README.md
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (generate with `openssl rand -hex 32`)
- `BELVO_SECRET_ID`: Belvo API secret ID
- `BELVO_SECRET_PASSWORD`: Belvo API secret password
- `BELVO_ENVIRONMENT`: `sandbox` or `production`

## Belvo Integration

Glass Finance uses Belvo to securely access banking data. To use Belvo:

1. Sign up at [Belvo Dashboard](https://dashboard.belvo.com)
2. Create a new application
3. Get your API credentials (Secret ID and Secret Password)
4. Add credentials to `.env`
5. Start with sandbox environment for testing

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
```

### Linting
```bash
ruff app/
```

## License

Proprietary - Glass Finance
