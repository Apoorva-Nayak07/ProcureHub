"""
Analytics & Reporting routes
GET /api/analytics/dashboard   – summary stats for the logged-in user
GET /api/analytics/weekly      – last-7-days activity breakdown
GET /api/analytics/trends      – monthly PO + bid counts (last 6 months)
GET /api/analytics/top-vendors – top 5 vendors by accepted bids (manager view)
GET /api/analytics/savings     – cost savings: avg vs accepted bid per PO
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.purchase_order import PurchaseOrder
from models.bid import Bid
from models.user import User

from datetime import datetime, timedelta
from collections import defaultdict
import json

analytics_bp = Blueprint("analytics", __name__)


def _caller():
    return json.loads(get_jwt_identity())


# ─────────────────────────────────────────────────────────────
# GET /api/analytics/dashboard
# Both roles – returns role-appropriate summary
# ─────────────────────────────────────────────────────────────
@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard_stats():
    user = _caller()

    if user["role"] == "procurement_manager":
        pos   = PurchaseOrder.query.filter_by(manager_id=user["id"]).all()
        po_ids = [p.id for p in pos]

        total_pos    = len(pos)
        open_pos     = sum(1 for p in pos if p.status == "open_for_bids")
        awarded_pos  = sum(1 for p in pos if p.status == "awarded")
        closed_pos   = sum(1 for p in pos if p.status == "closed")

        total_bids   = Bid.query.filter(Bid.po_id.in_(po_ids)).count() if po_ids else 0
        pending_bids = Bid.query.filter(Bid.po_id.in_(po_ids), Bid.status == "submitted").count() if po_ids else 0

        # avg bids per PO
        avg_bids = round(total_bids / total_pos, 1) if total_pos else 0

        # total spend on awarded bids
        awarded_bids = Bid.query.filter(Bid.po_id.in_(po_ids), Bid.status == "accepted").all() if po_ids else []
        total_spend  = sum(b.bid_amount for b in awarded_bids)

        return jsonify({
            "role":        "procurement_manager",
            "total_pos":   total_pos,
            "open_pos":    open_pos,
            "awarded_pos": awarded_pos,
            "closed_pos":  closed_pos,
            "total_bids":  total_bids,
            "pending_bids":pending_bids,
            "avg_bids_per_po": avg_bids,
            "total_spend": round(total_spend, 2),
        }), 200

    else:  # vendor
        bids      = Bid.query.filter_by(vendor_id=user["id"]).all()
        total     = len(bids)
        accepted  = sum(1 for b in bids if b.status == "accepted")
        rejected  = sum(1 for b in bids if b.status == "rejected")
        pending   = sum(1 for b in bids if b.status == "submitted")
        win_rate  = round((accepted / total) * 100, 1) if total else 0
        total_won = sum(b.bid_amount for b in bids if b.status == "accepted")

        return jsonify({
            "role":          "vendor",
            "total_bids":    total,
            "accepted_bids": accepted,
            "rejected_bids": rejected,
            "pending_bids":  pending,
            "win_rate_pct":  win_rate,
            "total_revenue": round(total_won, 2),
        }), 200


# ─────────────────────────────────────────────────────────────
# GET /api/analytics/weekly
# Activity in the last 7 days, broken down by day
# ─────────────────────────────────────────────────────────────
@analytics_bp.route("/weekly", methods=["GET"])
@jwt_required()
def weekly_report():
    user  = _caller()
    today = datetime.utcnow().date()
    week_ago = datetime.utcnow() - timedelta(days=6)

    days       = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    day_labels = [d.strftime("%a %d %b") for d in days]

    if user["role"] == "procurement_manager":
        pos = PurchaseOrder.query.filter(
            PurchaseOrder.manager_id == user["id"],
            PurchaseOrder.created_at >= week_ago
        ).all()

        po_ids = [p.id for p in PurchaseOrder.query.filter_by(manager_id=user["id"]).all()]
        bids = Bid.query.filter(
            Bid.po_id.in_(po_ids),
            Bid.created_at >= week_ago
        ).all() if po_ids else []

        po_by_day  = defaultdict(int)
        bid_by_day = defaultdict(int)

        for p in pos:
            if p.created_at:
                po_by_day[p.created_at.date().strftime("%a %d %b")] += 1
        for b in bids:
            if b.created_at:
                bid_by_day[b.created_at.date().strftime("%a %d %b")] += 1

        return jsonify({
            "role":       "procurement_manager",
            "labels":     day_labels,
            "pos_created":[po_by_day.get(d, 0) for d in day_labels],
            "bids_received":[bid_by_day.get(d, 0) for d in day_labels],
            "summary": {
                "pos_this_week":  len(pos),
                "bids_this_week": len(bids),
            }
        }), 200

    else:  # vendor
        bids = Bid.query.filter(
            Bid.vendor_id == user["id"],
            Bid.created_at >= week_ago
        ).all()

        bid_by_day = defaultdict(int)
        win_by_day = defaultdict(int)
        for b in bids:
            if b.created_at:
                label = b.created_at.date().strftime("%a %d %b")
                bid_by_day[label] += 1
                if b.status == "accepted":
                    win_by_day[label] += 1

        return jsonify({
            "role":       "vendor",
            "labels":     day_labels,
            "bids_submitted": [bid_by_day.get(d, 0) for d in day_labels],
            "bids_won":       [win_by_day.get(d, 0) for d in day_labels],
            "summary": {
                "bids_this_week": len(bids),
                "wins_this_week": sum(1 for b in bids if b.status == "accepted"),
            }
        }), 200


# ─────────────────────────────────────────────────────────────
# GET /api/analytics/trends
# Monthly PO + bid counts for the last 6 months (manager)
# Monthly bid count + win count (vendor)
# ─────────────────────────────────────────────────────────────
@analytics_bp.route("/trends", methods=["GET"])
@jwt_required()
def monthly_trends():
    user = _caller()
    now  = datetime.utcnow()

    # Build last 6 month labels
    months = []
    for i in range(5, -1, -1):
        m = (now.month - i - 1) % 12 + 1
        y = now.year - ((now.month - i - 1) // 12)
        months.append((y, m, datetime(y, m, 1).strftime("%b %Y")))

    if user["role"] == "procurement_manager":
        pos    = PurchaseOrder.query.filter_by(manager_id=user["id"]).all()
        po_ids = [p.id for p in pos]
        bids   = Bid.query.filter(Bid.po_id.in_(po_ids)).all() if po_ids else []

        po_counts  = defaultdict(int)
        bid_counts = defaultdict(int)

        for p in pos:
            if p.created_at:
                key = p.created_at.strftime("%b %Y")
                po_counts[key] += 1
        for b in bids:
            if b.created_at:
                key = b.created_at.strftime("%b %Y")
                bid_counts[key] += 1

        labels = [m[2] for m in months]
        return jsonify({
            "labels":    labels,
            "pos":       [po_counts.get(l, 0)  for l in labels],
            "bids":      [bid_counts.get(l, 0) for l in labels],
        }), 200

    else:  # vendor
        bids = Bid.query.filter_by(vendor_id=user["id"]).all()
        bid_counts = defaultdict(int)
        win_counts = defaultdict(int)
        for b in bids:
            if b.created_at:
                key = b.created_at.strftime("%b %Y")
                bid_counts[key] += 1
                if b.status == "accepted":
                    win_counts[key] += 1

        labels = [m[2] for m in months]
        return jsonify({
            "labels": labels,
            "bids":   [bid_counts.get(l, 0) for l in labels],
            "wins":   [win_counts.get(l, 0) for l in labels],
        }), 200


# ─────────────────────────────────────────────────────────────
# GET /api/analytics/top-vendors
# Manager only – top 5 vendors by accepted bids
# ─────────────────────────────────────────────────────────────
@analytics_bp.route("/top-vendors", methods=["GET"])
@jwt_required()
def top_vendors():
    user = _caller()
    if user["role"] != "procurement_manager":
        return jsonify({"message": "Access denied"}), 403

    po_ids = [p.id for p in PurchaseOrder.query.filter_by(manager_id=user["id"]).all()]
    if not po_ids:
        return jsonify([]), 200

    accepted = Bid.query.filter(
        Bid.po_id.in_(po_ids),
        Bid.status == "accepted"
    ).all()

    vendor_stats = defaultdict(lambda: {"wins": 0, "total_value": 0.0, "name": ""})
    for b in accepted:
        vs = vendor_stats[b.vendor_id]
        vs["wins"]        += 1
        vs["total_value"] += b.bid_amount
        vs["name"]         = b.vendor.company_name if b.vendor else f"Vendor #{b.vendor_id}"

    ranked = sorted(vendor_stats.items(), key=lambda x: x[1]["wins"], reverse=True)[:5]
    result = [
        {
            "vendor_id":    vid,
            "company_name": data["name"],
            "wins":         data["wins"],
            "total_value":  round(data["total_value"], 2),
        }
        for vid, data in ranked
    ]
    return jsonify(result), 200


# ─────────────────────────────────────────────────────────────
# GET /api/analytics/savings
# Manager only – for each awarded PO: avg bid vs accepted bid
# ─────────────────────────────────────────────────────────────
@analytics_bp.route("/savings", methods=["GET"])
@jwt_required()
def cost_savings():
    user = _caller()
    if user["role"] != "procurement_manager":
        return jsonify({"message": "Access denied"}), 403

    pos = PurchaseOrder.query.filter_by(manager_id=user["id"], status="awarded").all()
    result = []
    total_saved = 0.0

    for po in pos:
        bids = Bid.query.filter_by(po_id=po.id).all()
        if not bids:
            continue
        amounts       = [b.bid_amount for b in bids]
        avg_amount    = sum(amounts) / len(amounts)
        accepted_bid  = next((b for b in bids if b.status == "accepted"), None)
        if not accepted_bid:
            continue
        saved         = avg_amount - accepted_bid.bid_amount
        total_saved  += saved
        result.append({
            "po_id":            po.id,
            "item_description": po.item_description,
            "avg_bid":          round(avg_amount, 2),
            "accepted_bid":     round(accepted_bid.bid_amount, 2),
            "saved":            round(saved, 2),
            "bid_count":        len(bids),
        })

    return jsonify({
        "pos":         result,
        "total_saved": round(total_saved, 2),
    }), 200
