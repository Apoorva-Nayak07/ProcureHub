from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db, bcrypt

jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow all localhost Vite dev server ports
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]}})

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Import models so db.create_all() picks them up
    from models.user import User
    from models.purchase_order import PurchaseOrder
    from models.bid import Bid
    from models.notification import Notification

    # Register Blueprints
    from routes.auth import auth_bp
    from routes.manager import manager_bp
    from routes.vendor import vendor_bp
    from routes.v1_procurement import v1_procurement_bp
    from routes.v1_vendor import v1_vendor_bp
    from routes.analytics import analytics_bp
    from routes.notifications import notifications_bp

    app.register_blueprint(auth_bp,           url_prefix="/api/auth")
    app.register_blueprint(manager_bp,        url_prefix="/api/manager")
    app.register_blueprint(vendor_bp,         url_prefix="/api/vendor")
    app.register_blueprint(v1_procurement_bp, url_prefix="/api/v1/procurement")
    app.register_blueprint(v1_vendor_bp,      url_prefix="/api/v1/vendor")
    app.register_blueprint(analytics_bp,      url_prefix="/api/analytics")
    app.register_blueprint(notifications_bp,  url_prefix="/api/notifications")

    @app.route("/")
    def home():
        return {"message": "ProcureHub Backend Running Successfully"}

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
