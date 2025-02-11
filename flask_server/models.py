from config import db


class Restaurant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    restaurant_name = db.Column(db.String(120), unique=False, nullable=False)
    address = db.Column(db.String(200), unique=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "restaurantName": self.restaurant_name,
            "address": self.address,
        }