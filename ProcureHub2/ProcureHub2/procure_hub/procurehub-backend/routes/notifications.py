"""
Notifications routes
GET  /api/notifications/         – get all notifications for current user
PUT  /api/notifications/<id>/read – mark one as read
PUT  /api/notifications/read-all  – mark all as read
GET  /api/notifications/unread-count – unread badge count
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.notification import Notification

import json

notifications_bp = Blueprint("notifications", __name__)

"""
Notifications routes
GET  /api/notifications/         – get all notifications for current user
PUT  /api/notifications/<id>/read – mark one as read
PUT  /api/notifications/read-all  – mark all as read
GET  /api/notifications/unread-count – unread badge count
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.notification import Notification

import json

notifications_bp = Blueprint("notifications", __name__)


def _caller():
    return json.loads(get_jwt_identity())


# ─────────────────────────────────────────
# GET /api/notifications/
# ─────────────────────────────────────────
@notifications_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    user = _caller()
    notifs = (
        Notification.query
        .filter_by(user_id=user["id"])
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return jsonify([n.to_dict() for n in notifs]), 200


# ─────────────────────────────────────────
# GET /api/notifications/unread-count
# ─────────────────────────────────────────
@notifications_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def unread_count():
    user  = _caller()
    count = Notification.query.filter_by(user_id=user["id"], is_read=False).count()
    return jsonify({"unread": count}), 200


# ─────────────────────────────────────────
# PUT /api/notifications/<id>/read
# ─────────────────────────────────────────
@notifications_bp.route("/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notif_id):
    user  = _caller()
    notif = Notification.query.filter_by(id=notif_id, user_id=user["id"]).first()
    if not notif:
        return jsonify({"message": "Notification not found"}), 404
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200


# ─────────────────────────────────────────
# PUT /api/notifications/read-all
# ─────────────────────────────────────────
@notifications_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user = _caller()
    Notification.query.filter_by(user_id=user["id"], is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200

def _caller():
    return json.loads(get_jwt_identity())


# ─────────────────────────────────────────
# GET /api/notifications/
# ─────────────────────────────────────────
@notifications_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    user = _caller()
    notifs = (
        Notification.query
        .filter_by(user_id=user["id"])
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return jsonify([n.to_dict() for n in notifs]), 200


# ─────────────────────────────────────────
# GET /api/notifications/unread-count
# ─────────────────────────────────────────
@notifications_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def unread_count():
    user  = _caller()
    count = Notification.query.filter_by(user_id=user["id"], is_read=False).count()
    return jsonify({"unread": count}), 200


# ─────────────────────────────────────────
# PUT /api/notifications/<id>/read
# ─────────────────────────────────────────
@notifications_bp.route("/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notif_id):
    user  = _caller()
    notif = Notification.query.filter_by(id=notif_id, user_id=user["id"]).first()
    if not notif:
        return jsonify({"message": "Notification not found"}), 404
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200


# ─────────────────────────────────────────
# PUT /api/notifications/read-all
# ─────────────────────────────────────────
@notifications_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user = _caller()
    Notification.query.filter_by(user_id=user["id"], is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200
