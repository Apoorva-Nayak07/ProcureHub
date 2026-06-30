from flask import Blueprint, request, jsonify

from models import db
from models.user import User

from utils.auth import (
    hash_password,
    verify_password,
    generate_token
)

auth_bp = Blueprint("auth", __name__)


# -------------------------
# Register
# -------------------------
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    company_name = data.get("company_name")
    role = data.get("role")

    if not email or not password or not company_name or not role:
        return jsonify({"message": "All fields are required"}), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"message": "Email already exists"}), 400

    new_user = User(
        email=email,
        password_hash=hash_password(password),
        company_name=company_name,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User Registered Successfully"}), 201


# -------------------------
# Login
# -------------------------
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "Invalid Email"}), 401

    if not verify_password(password, user.password_hash):
        return jsonify({"message": "Invalid Password"}), 401

    token = generate_token(user)

    return jsonify({
        "message": "Login Successful",
        "token": token,
        "role": user.role,
        "user_id": user.id,
        "company_name": user.company_name
    }), 200