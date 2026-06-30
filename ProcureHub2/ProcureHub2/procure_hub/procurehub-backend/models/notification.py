from models import db
from datetime import datetime


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    # 'bid_received' | 'bid_awarded' | 'bid_rejected' | 'po_closed' | 'weekly_report'
    type = db.Column(db.String(50), nullable=False)

    message = db.Column(db.String(500), nullable=False)

    is_read = db.Column(db.Boolean, default=False, nullable=False)

    # optional reference IDs for deep-linking
    po_id  = db.Column(db.Integer, nullable=True)
    bid_id = db.Column(db.Integer, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship("User", backref="notifications")

    def to_dict(self):
        return {
            "id":         self.id,
            "user_id":    self.user_id,
            "type":       self.type,
            "message":    self.message,
            "is_read":    self.is_read,
            "po_id":      self.po_id,
            "bid_id":     self.bid_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
