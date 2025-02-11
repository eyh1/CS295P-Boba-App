# CS295P-Boba-App
Boba App for CS295 Capstone/Keystone project

How to install and run the flask app, locally or in AWS:

cd flask_server
sudo apt update
sudo apt install pip
sudo apt install python3-venv
python3 -m venv venv
. venv/bin/activate
pip install Flask
pip install Flask-Cors
pip3 install Flask-SQLAlchemy
export FLASK_APP=main.py
python3 -m flask run --host=0.0.0.0
# connect to 54.193.65.182:5000

How to connect to the AWS intance:

chmod 400 "boba_app_eric.pem"
ssh -i "boba_app_eric.pem" ubuntu@ec2-54-193-65-182.us-west-1.compute.amazonaws.com

# Frontend Setup
cd frontend\
npm install\
npm run dev\