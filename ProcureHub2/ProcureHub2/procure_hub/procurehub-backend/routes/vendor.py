from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.purchase_order import PurchaseOrder
from models.bid import Bid
from models.notification import Notification

import json

vendor_bp = Blueprint("vendor", __name__)


# -------------------------
# Marketplace
# -------------------------
@vendor_bp.route("/marketplace", methods=["GET"])
@jwt_required()
def marketplace():

    orders = PurchaseOrder.query.filter_by(status="open_for_bids").all()

    result = []
    for po in orders:
        d = po.to_dict()
        # Include the manager's company name for display
        d["company_name"] = po.manager.company_name if po.manager else None
        result.append(d)

    return jsonify(result)


# -------------------------
# Submit Bid
# -------------------------
@vendor_bp.route("/submit-bid", methods=["POST"])
@jwt_required()
def submit_bid():

    user = json.loads(get_jwt_identity())

    if user["role"] != "vendor":
        return jsonify({"message": "Access Denied"}), 403

    data = request.get_json()

    if not data or not data.get("po_id") or not data.get("bid_amount") or not data.get("promised_delivery_days"):
        return jsonify({"message": "All fields are required"}), 400

    # Check PO exists and is still open
    po = db.session.get(PurchaseOrder, data["po_id"])
    if not po:
        return jsonify({"message": "Purchase Order Not Found"}), 404
    if po.status != "open_for_bids":
        return jsonify({"message": "This PO is no longer accepting bids"}), 400

    # Prevent duplicate bid from same vendor
    existing = Bid.query.filter_by(po_id=data["po_id"], vendor_id=user["id"]).first()
    if existing:
        return jsonify({"message": "You have already submitted a bid for this PO"}), 400

    bid = Bid(
        po_id=data["po_id"],
        vendor_id=user["id"],
        bid_amount=data["bid_amount"],
        promised_delivery_days=data["promised_delivery_days"],
        status="submitted"
    )

    db.session.add(bid)
    db.session.commit()

    # Notify the manager that a new bid arrived
    if po.manager_id:
        db.session.add(Notification(
            user_id=po.manager_id,
            type="bid_received",
            message=f"New bid of ₹{data['bid_amount']:,.0f} received on PO-{po.id:04d}: {po.item_description[:60]}.",
            po_id=po.id,
            bid_id=bid.id,
        ))
        db.session.commit()

    return jsonify({"message": "Bid Submitted Successfully", "id": bid.id}), 201


# -------------------------
# My Bids
# -------------------------
@vendor_bp.route("/my-bids", methods=["GET"])
@jwt_required()
def my_bids():

    user = json.loads(get_jwt_identity())

    if user["role"] != "vendor":
        return jsonify({"message": "Access Denied"}), 403

    bids = Bid.query.filter_by(vendor_id=user["id"]).all()

    return jsonify([bid.to_dict() for bid in bids])
