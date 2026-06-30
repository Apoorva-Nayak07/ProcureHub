from models import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(db.String(100), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=False)

    company_name = db.Column(db.String(100), nullable=False)

    role = db.Column(
        db.Enum("procurement_manager", "vendor", name="user_roles"),
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "company_name": self.company_name,
            "role": self.role
        }