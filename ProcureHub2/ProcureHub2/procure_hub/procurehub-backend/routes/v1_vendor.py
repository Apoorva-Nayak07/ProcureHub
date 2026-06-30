"""
v1 REST API – Vendor routes
GET  /api/v1/vendor/marketplace      →  list open POs
POST /api/v1/vendor/bids/submit      →  submit a bid
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.purchase_order import PurchaseOrder
from models.bid import Bid

import json

v1_vendor_bp = Blueprint("v1_vendor", __name__)


# ─────────────────────────────────────────
# GET /api/v1/vendor/marketplace
# Protected – vendor only
# ─────────────────────────────────────────
@v1_vendor_bp.route("/marketplace", methods=["GET"])
@jwt_required()
def marketplace_v1():
    """
    1. Validates caller token maps to an active 'vendor' role.
    2. Queries purchase_orders where status == 'open_for_bids'.
    3. Returns a clean JSON array of matching records.
    """
    # 1 – Role verification
    try:
        caller = json.loads(get_jwt_identity())
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid token payload"}), 401

    if caller.get("role") != "vendor":
        return jsonify({"message": "Access denied: vendor role required"}), 403

    # 2 & 3 – Fetch all open POs
    open_pos = PurchaseOrder.query.filter_by(status="open_for_bids").all()

    result = []
    for po in open_pos:
        entry = po.to_dict()
        entry["company_name"] = po.manager.company_name if po.manager else None
        result.append(entry)

    return jsonify(result), 200


# ─────────────────────────────────────────
# POST /api/v1/vendor/bids/submit
# Protected – vendor only
# ─────────────────────────────────────────
@v1_vendor_bp.route("/bids/submit", methods=["POST"])
@jwt_required()
def submit_bid_v1():
    """
    1. Authenticates the caller and confirms 'vendor' role.
    2. Validates the target PO exists and is in 'open_for_bids' state.
    3. Validates bid_amount and promised_delivery_days.
    4. Prevents duplicate bids from the same vendor on the same PO.
    5. Persists the bid with status 'submitted'.
    """
    # 1 – Identity / role check
    try:
        caller = json.loads(get_jwt_identity())
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid token payload"}), 401

    if caller.get("role") != "vendor":
        return jsonify({"message": "Access denied: vendor role required"}), 403

    # Body parsing
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "Request body must be valid JSON"}), 400

    po_id                  = data.get("po_id")
    bid_amount             = data.get("bid_amount")
    promised_delivery_days = data.get("promised_delivery_days")

    # Field presence checks
    if po_id is None:
        return jsonify({"message": "po_id is required"}), 400
    if bid_amount is None:
        return jsonify({"message": "bid_amount is required"}), 400
    if promised_delivery_days is None:
        return jsonify({"message": "promised_delivery_days is required"}), 400

    # Type coercion & range validation
    try:
        po_id = int(po_id)
    except (ValueError, TypeError):
        return jsonify({"message": "po_id must be an integer"}), 400

    try:
        bid_amount = float(bid_amount)
        if bid_amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"message": "bid_amount must be a positive number"}), 400

    try:
        promised_delivery_days = int(promised_delivery_days)
        if promised_delivery_days < 1:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"message": "promised_delivery_days must be a positive integer"}), 400

    # 2 – PO existence & active state check
    po = db.session.get(PurchaseOrder, po_id)
    if not po:
        return jsonify({"message": "Purchase order not found"}), 404
    if po.status != "open_for_bids":
        return jsonify({"message": "This purchase order is no longer accepting bids"}), 400

    # 4 – Duplicate bid guard
    existing = Bid.query.filter_by(po_id=po_id, vendor_id=caller["id"]).first()
    if existing:
        return jsonify({"message": "You have already submitted a bid for this purchase order"}), 409

    # 5 – Persist bid
    bid = Bid(
        po_id=po_id,
        vendor_id=caller["id"],
        bid_amount=bid_amount,
        promised_delivery_days=promised_delivery_days,
        status="submitted",
    )

    db.session.add(bid)
    db.session.commit()

    return jsonify({
        "message": "Bid submitted successfully",
        "data": bid.to_dict()
    }), 201
