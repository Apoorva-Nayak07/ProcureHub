from models import bcrypt
from flask_jwt_extended import create_access_token
import json


def hash_password(password):
    """Hash the user's password before storing it."""
    return bcrypt.generate_password_hash(password).decode("utf-8")


def verify_password(password, password_hash):
    """Verify the entered password against the stored hash."""
    return bcrypt.check_password_hash(password_hash, password)


def generate_token(user):
    """
    Generate JWT access token.
    Identity is stored as a JSON string for compatibility with
    Flask-JWT-Extended v4+.
    """
    identity = json.dumps({
        "id": user.id,
        "email": user.email,
        "role": user.role
    })
    return create_access_token(identity=identity)
