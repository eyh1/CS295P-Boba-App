# CS295P-Boba-App
Boba App for CS295 Capstone/Keystone project

How to install and run the flask app:

python3 -m venv venv
. venv/bin/activate
pip install Flask
pip install Flask-Cors
export FLASK_APP=main.py
python3 -m flask run --host=0.0.0.0

How to connect to the AWS intance:
chmod 400 "boba_app_eric.pem"
ssh -i "boba_app_eric.pem" ubuntu@ec2-54-193-65-182.us-west-1.compute.amazonaws.com