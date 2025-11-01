# Quick Start Guide

Get Niko Free backend up and running in 5 minutes!

## Prerequisites

- Python 3.9 or higher
- PostgreSQL 12 or higher
- Git

## Installation

### 1. Quick Setup (Automated)

```bash
# Make setup script executable (if not already)
chmod +x setup.sh

# Run setup script
./setup.sh
```

### 2. Manual Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Create uploads directory
mkdir -p uploads/{events,logos,profiles,qrcodes}
```

## Configuration

### 3. Edit `.env` file

Minimum required configuration:

```env
# Flask
SECRET_KEY=your-secret-key-change-this
JWT_SECRET_KEY=your-jwt-secret-change-this

# Database (use SQLite for quick start)
DATABASE_URL=sqlite:///nikofree.db

# Email (optional for now)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# MPesa (optional for now - use sandbox)
MPESA_ENVIRONMENT=sandbox
```

For production, use PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nikofree
```

## Database Setup

### 4. Initialize Database

```bash
# Activate virtual environment if not already
source venv/bin/activate

# Initialize database
flask init_db

# Seed categories and locations
flask seed_db

# Create admin user
flask create_admin
```

You'll be prompted to enter:
- Admin email
- Password
- First name
- Last name

## Run the Application

### 5. Start Development Server

```bash
flask run
```

The API will be available at: `http://localhost:5000`

### Test the API

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {"status": "healthy", "message": "Niko Free API is running"}
```

## Test Authentication

### 6. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 7. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

Copy the `access_token` from the response.

### 8. Access Protected Endpoint

```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Common Tasks

### View All Events
```bash
curl http://localhost:5000/api/events/
```

### Get Categories
```bash
curl http://localhost:5000/api/events/categories
```

### Get Locations
```bash
curl http://localhost:5000/api/events/locations
```

## Using with Frontend

If you have a frontend application:

1. Update `FRONTEND_URL` in `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

2. The backend will allow CORS requests from this origin.

## Development Tips

### Run in Debug Mode
```bash
FLASK_ENV=development flask run
```

### Run on Different Port
```bash
flask run --port 8000
```

### View Database in Shell
```bash
flask shell
>>> User.query.all()
>>> Event.query.all()
```

### Reset Database
```bash
rm nikofree.db  # If using SQLite
flask init_db
flask seed_db
```

## API Documentation

- Complete API reference: See `API_ENDPOINTS.md`
- API summary: See `API_SUMMARY.md`
- Deployment guide: See `DEPLOYMENT.md`

## Testing with Postman

1. Import the API endpoints into Postman
2. Create an environment with:
   - `base_url`: http://localhost:5000
   - `token`: (set after login)

3. Test the authentication flow:
   - Register → Login → Get Profile

## Troubleshooting

### Port already in use
```bash
# Use different port
flask run --port 8000
```

### Database connection error
```bash
# For SQLite: Check file permissions
ls -la nikofree.db

# For PostgreSQL: Check if service is running
sudo systemctl status postgresql
```

### Module not found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Permission denied on setup.sh
```bash
chmod +x setup.sh
```

## Next Steps

1. ✅ Backend is running
2. 📱 Connect your frontend application
3. 🧪 Test all API endpoints
4. 📝 Configure email settings
5. 💳 Set up MPesa for payments
6. 🚀 Deploy to production

## Production Deployment

See `DEPLOYMENT.md` for comprehensive deployment guide.

Quick production checklist:
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Configure production email service
- [ ] Set up MPesa production credentials
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups

## Support

For issues or questions:
- Check documentation files
- Review error logs
- Contact: support@nikofree.com

---

**Happy Coding! 🎉**

