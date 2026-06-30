from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.purchase_order import PurchaseOrder
from models.bid import Bid
from models.notification import Notification

from datetime import datetime
import json

manager_bp = Blueprint("manager", __name__)


# -------------------------
# Create Purchase Order
# -------------------------
@manager_bp.route("/create-po", methods=["POST"])
@jwt_required()
def create_purchase_order():

    user = json.loads(get_jwt_identity())

    if user["role"] != "procurement_manager":
        return jsonify({"message": "Access Denied"}), 403

    data = request.get_json()

    if not data or not data.get("item_description") or not data.get("quantity") or not data.get("target_delivery_date"):
        return jsonify({"message": "All fields are required"}), 400

    po = PurchaseOrder(
        manager_id=user["id"],
        item_description=data["item_description"],
        quantity=data["quantity"],
        target_delivery_date=datetime.strptime(
            data["target_delivery_date"],
            "%Y-%m-%d"
        ).date(),
        status="open_for_bids"
    )

    db.session.add(po)
    db.session.commit()

    return jsonify({"message": "Purchase Order Created", "id": po.id}), 201


# -------------------------
# View All Purchase Orders
# -------------------------
@manager_bp.route("/purchase-orders", methods=["GET"])
@jwt_required()
def purchase_orders():

    user = json.loads(get_jwt_identity())

    if user["role"] != "procurement_manager":
        return jsonify({"message": "Access Denied"}), 403

    orders = PurchaseOrder.query.filter_by(manager_id=user["id"]).all()

    return jsonify([po.to_dict() for po in orders])


# -------------------------
# View Bids for a PO
# -------------------------
@manager_bp.route("/bids/<int:po_id>", methods=["GET"])
@jwt_required()
def view_bids(po_id):

    user = json.loads(get_jwt_identity())

    if user["role"] != "procurement_manager":
        return jsonify({"message": "Access Denied"}), 403

    po = db.session.get(PurchaseOrder, po_id)
    if not po:
        return jsonify({"message": "Purchase Order Not Found"}), 404

    bids = Bid.query.filter_by(po_id=po_id).all()

    # Include company_name from the vendor relationship
    result = []
    for bid in bids:
        d = bid.to_dict()
        d["company_name"] = bid.vendor.company_name if bid.vendor else None
        result.append(d)

    return jsonify(result)


# -------------------------
# Award Bid
# -------------------------
@manager_bp.route("/award/<int:bid_id>", methods=["PUT"])
@jwt_required()
def award_bid(bid_id):

    user = json.loads(get_jwt_identity())

    if user["role"] != "procurement_manager":
        return jsonify({"message": "Access Denied"}), 403

    bid = db.session.get(Bid, bid_id)

    if not bid:
        return jsonify({"message": "Bid Not Found"}), 404

    # Verify the PO belongs to this manager
    po = db.session.get(PurchaseOrder, bid.po_id)
    if not po or po.manager_id != user["id"]:
        return jsonify({"message": "Access Denied"}), 403

    if po.status == "awarded":
        return jsonify({"message": "Bid already awarded for this PO"}), 400

    all_bids = Bid.query.filter_by(po_id=bid.po_id).all()
    for b in all_bids:
        b.status = "accepted" if b.id == bid.id else "rejected"

    po.status = "awarded"
    db.session.commit()

    # ── Notifications ──────────────────────────────────────────
    # Tell the winning vendor
    db.session.add(Notification(
        user_id=bid.vendor_id,
        type="bid_awarded",
        message=f"Congratulations! Your bid of ₹{bid.bid_amount:,.0f} was awarded for PO-{po.id:04d}: {po.item_description[:60]}.",
        po_id=po.id,
        bid_id=bid.id,
    ))
    # Tell rejected vendors
    for b in all_bids:
        if b.id != bid.id:
            db.session.add(Notification(
                user_id=b.vendor_id,
                type="bid_rejected",
                message=f"Your bid for PO-{po.id:04d}: {po.item_description[:60]} was not selected.",
                po_id=po.id,
                bid_id=b.id,
            ))
    db.session.commit()

    return jsonify({"message": "Bid Awarded Successfully"})


# -------------------------
# Close Purchase Order
# -------------------------
@manager_bp.route("/close-po/<int:po_id>", methods=["PUT"])
@jwt_required()
def close_po(po_id):

    user = json.loads(get_jwt_identity())

    if user["role"] != "procurement_manager":
        return jsonify({"message": "Access Denied"}), 403

    po = db.session.get(PurchaseOrder, po_id)
    if not po:
        return jsonify({"message": "Purchase Order Not Found"}), 404

    if po.manager_id != user["id"]:
        return jsonify({"message": "Access Denied"}), 403

    if po.status == "closed":
        return jsonify({"message": "Purchase Order is already closed"}), 400

    # Reject any remaining submitted bids
    open_bids = Bid.query.filter_by(po_id=po_id, status="submitted").all()
    for b in open_bids:
        b.status = "rejected"
        db.session.add(Notification(
            user_id=b.vendor_id,
            type="po_closed",
            message=f"PO-{po.id:04d} has been closed by the manager. Your bid was not selected.",
            po_id=po.id,
            bid_id=b.id,
        ))

    po.status = "closed"
    db.session.commit()

    return jsonify({"message": "Purchase Order Closed Successfully"}), 200
