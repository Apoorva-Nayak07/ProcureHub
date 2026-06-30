"""
v1 REST API – Procurement Manager routes
POST /api/v1/procurement/po  →  create a purchase order
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.purchase_order import PurchaseOrder

from datetime import datetime
import json

v1_procurement_bp = Blueprint("v1_procurement", __name__)


# ─────────────────────────────────────────
# POST /api/v1/procurement/po
# Protected – procurement_manager only
# ─────────────────────────────────────────
@v1_procurement_bp.route("/po", methods=["POST"])
@jwt_required()
def create_po_v1():
    """
    1. Validates caller identity matches 'procurement_manager' role.
    2. Verifies required body fields are present and well-formed.
    3. Inserts a new row into purchase_orders.
    4. Initialises status to 'open_for_bids'.
    """
    # 1 – Identity / role check
    try:
        caller = json.loads(get_jwt_identity())
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid token payload"}), 401

    if caller.get("role") != "procurement_manager":
        return jsonify({"message": "Access denied: procurement manager role required"}), 403

    # 2 – Structural / data-integrity validation
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "Request body must be valid JSON"}), 400

    item_description   = data.get("item_description")
    quantity           = data.get("quantity")
    target_delivery_date = data.get("target_delivery_date")

    if not item_description or not str(item_description).strip():
        return jsonify({"message": "item_description is required"}), 400

    if quantity is None:
        return jsonify({"message": "quantity is required"}), 400
    try:
        quantity = int(quantity)
        if quantity < 1:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"message": "quantity must be a positive integer"}), 400

    if not target_delivery_date:
        return jsonify({"message": "target_delivery_date is required (YYYY-MM-DD)"}), 400
    try:
        delivery_date = datetime.strptime(target_delivery_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "target_delivery_date must be in YYYY-MM-DD format"}), 400

    # 3 – Persist to purchase_orders
    po = PurchaseOrder(
        manager_id=caller["id"],
        item_description=item_description.strip(),
        quantity=quantity,
        target_delivery_date=delivery_date,
        status="open_for_bids",          # 4 – initialise status
    )

    db.session.add(po)
    db.session.commit()

    return jsonify({
        "message": "Purchase order created successfully",
        "data": po.to_dict()
    }), 201
