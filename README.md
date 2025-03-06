# CS295P-Boba-App
Boba App for CS295 Capstone/Keystone project

How to install and run the flask app, locally or in AWS:

sudo apt update

sudo apt install pip

sudo apt install python3-venv

python3 -m venv venv

. venv/bin/activate

OR

venv/Scripts/activate

pip install -r requirements.txt

cd backend

python manage.py runserver


When making changes to the models:

cd backend

python manage.py makemigrations

python manage.py migrate
# connect to 54.193.65.182:5000

How to connect to the AWS intance:

chmod 400 "boba_app_eric.pem"
ssh -i "boba_app_eric.pem" ubuntu@ec2-54-193-65-182.us-west-1.compute.amazonaws.com

# Frontend Setup
cd frontend\
npm install\
npm install @mui/material
npm i @emotion/react @emotion/styled
npm install @mui/icons-material
npm install tailwindcss @tailwindcss/vite
npm install axios react-router-dom jwt-decode
npm run dev\