# Flask Backend (app.py)
from flask import jsonify, render_template
from config import app, db
from models import Restaurant


# Serve HTML Pages
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

# API Endpoint
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    restaurants = Restaurant.query.all()
    json_restaurants = list(map(lambda x: x.to_json(), restaurants))
    return jsonify({"restaurants": json_restaurants})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
        restaurant = "Fake Place"
        address = "Address"

        new_restaurant = Restaurant(restaurant_name=restaurant, address=address)
        try:
            db.session.add(new_restaurant)
            db.session.commit()
        except Exception as e:
            print(e)
            print("e")
    app.run(debug=True, port=8000)