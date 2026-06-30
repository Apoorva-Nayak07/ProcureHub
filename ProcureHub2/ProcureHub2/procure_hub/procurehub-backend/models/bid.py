from models import db
from datetime import datetime


class Bid(db.Model):
    __tablename__ = "bids"

    id = db.Column(db.Integer, primary_key=True)

    po_id = db.Column(
        db.Integer,
        db.ForeignKey("purchase_orders.id"),
        nullable=False
    )

    vendor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    bid_amount = db.Column(
        db.Float,
        nullable=False
    )

    promised_delivery_days = db.Column(
        db.Integer,
        nullable=False
    )

    status = db.Column(
        db.Enum(
            "submitted",
            "accepted",
            "rejected",
            name="bid_status"
        ),
        default="submitted",
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    purchase_order = db.relationship(
        "PurchaseOrder",
        backref="bids"
    )

    vendor = db.relationship(
        "User",
        backref="bids"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "po_id": self.po_id,
            "vendor_id": self.vendor_id,
            "bid_amount": self.bid_amount,
            "promised_delivery_days": self.promised_delivery_days,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }