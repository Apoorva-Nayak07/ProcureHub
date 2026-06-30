from models import db
from datetime import datetime


class PurchaseOrder(db.Model):
    __tablename__ = "purchase_orders"

    id = db.Column(db.Integer, primary_key=True)

    manager_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    item_description = db.Column(
        db.String(255),
        nullable=False
    )

    quantity = db.Column(
        db.Integer,
        nullable=False
    )

    target_delivery_date = db.Column(
        db.Date,
        nullable=False
    )

    status = db.Column(
        db.Enum(
            "open_for_bids",
            "awarded",
            "closed",
            name="po_status"
        ),
        default="open_for_bids",
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    manager = db.relationship(
        "User",
        backref="purchase_orders"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "manager_id": self.manager_id,
            "item_description": self.item_description,
            "quantity": self.quantity,
            "target_delivery_date": str(self.target_delivery_date),
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }