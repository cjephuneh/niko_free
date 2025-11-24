from flask import Flask, request, jsonify, Response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    exempt_methods=["OPTIONS"]
)


def create_app(config_name='default'):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    # Disable strict slashes to prevent redirects
    app.url_map.strict_slashes = False
    
    limiter.init_app(app)
    
    # Register blueprints
    from app.routes import auth, users, partners, admin, events, tickets, payments, notifications
    
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(users.bp, url_prefix='/api/users')
    app.register_blueprint(partners.bp, url_prefix='/api/partners')
    app.register_blueprint(admin.bp, url_prefix='/api/admin')
    app.register_blueprint(events.bp, url_prefix='/api/events')
    app.register_blueprint(tickets.bp, url_prefix='/api/tickets')
    app.register_blueprint(payments.bp, url_prefix='/api/payments')
    app.register_blueprint(notifications.bp, url_prefix='/api/notifications')
    
    # Catch-all OPTIONS handler - must be after blueprints
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        """Handle all OPTIONS requests"""
        response = Response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers')
        response.headers.add('Access-Control-Max-Age', '3600')
        return response, 200
    
    # Handle OPTIONS in before_request as backup
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = Response()
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers')
            response.headers.add('Access-Control-Max-Age', '3600')
            return response, 200
    
    # Add CORS headers to all responses
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
        response.headers.add('Access-Control-Max-Age', '3600')
        return response
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Niko Free API is running'}, 200
    
    # Test CORS endpoint
    @app.route('/test-cors', methods=['GET', 'POST', 'OPTIONS'])
    def test_cors():
        if request.method == 'OPTIONS':
            response = jsonify({'message': 'CORS test'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            return response
        return jsonify({'message': 'CORS is working', 'method': request.method}), 200
    
    @app.route('/')
    def index():
        return {
            'name': 'Niko Free API',
            'version': '1.0.0',
            'status': 'active'
        }, 200
    
    return app


