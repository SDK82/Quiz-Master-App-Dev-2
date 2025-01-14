from flask import current_app as app, jsonify, render_template, request
from backend.models import db, User, Role
from flask_security import auth_required, login_required, current_user
from flask_security.utils import verify_password, hash_password

datastore = app.security.datastore

@app.get('/')
 # This is a corrected decorator from Flask-Security
def hello():
    return render_template('index.html')

@app.route('/test')
@auth_required()  # This is a corrected decorator from Flask-Security
def test():
    return 'Test for only authenticated users'

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and Password are required'}), 400

    user = datastore.find_user(email=email)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if verify_password(password, user.password):
        # Ensure get_auth_token() is defined or use Flask-Security's method for token generation
        return jsonify({
            'token': user.get_auth_token(),  # Ensure this method exists or use another method for token
            'email': user.email,
            'role': user.roles[0].name if user.roles else 'user',  # Ensure role exists
            'id': user.id
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401

from datetime import datetime

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    full_name = data.get('full_name')
    dob_str = data.get('dob')  # Expecting format 'DD/MM/YYYY'
    qualification = data.get('qualification')

    # Check if all necessary fields are provided
    if not all([email, password, role, full_name, dob_str, qualification]):
        return jsonify({'message': 'All fields are required'}), 400

    # Check if role is valid
    if role not in ['admin', 'user']:
        return jsonify({'message': 'Invalid role'}), 400

    # Convert the dob string to a Python date object
    try:
        dob = datetime.strptime(dob_str, '%d/%m/%Y').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use DD/MM/YYYY'}), 400

    # Check if user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({'message': 'User already exists'}), 400

    try:
        # Fetch the Role object from the database
        role = Role.query.filter_by(name=role).first()
        if not role:
            return jsonify({'message': f'Role "{role}" does not exist'}), 400

        # Create the user
        datastore.create_user(
            email=email,
            password=hash_password(password),
            roles=[role],
            active=True,
            full_name=full_name,
            dob=dob,  # Pass the converted date object
            qualification=qualification,
        )
        db.session.commit()

        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating user: {str(e)}'}), 400 

