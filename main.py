# Flask Backend (app.py)
from flask import Flask, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, template_folder="templates")

# Allow React frontend to communicate with Flask backend
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

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

if __name__ == '__main__':
    app.run(debug=True, port=8000)