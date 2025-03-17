from uuid import uuid4
from flask import current_app as app, jsonify, render_template, request
from backend.models import db, User, Role
from flask_security import auth_required, login_required, current_user
from flask_security.utils import verify_password, hash_password
from datetime import datetime
from backend.celery.tasks import add
from celery.result import AsyncResult

datastore = app.security.datastore
cache = app.cache

@app.get('/')
 # This is a corrected decorator from Flask-Security
def hello():
    return render_template('index.html')

@app.route('/test')
@auth_required()  # This is a corrected decorator from Flask-Security
def test():
    return 'Test for only authenticated users'

@app.get('/cache')
@cache.cached(timeout=5)
def cache():
    return{'time': str(datetime.now())}

@app.get('/celery')
def celery():
    task = add.delay(10,20)
    return {'task_id' : task.id}

@app.get('/get-celery-data/<int:id>')
def getData(id):
    result = AsyncResult(id)
    if result.ready():
        return {'result': result.result},200
    else:
        return {'status': 'Task not ready'},405
    
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
            'id': user.id,
            'full_name': user.full_name,
            'loggedIn': True
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role_name = data.get('role')
    full_name = data.get('full_name')
    dob_str = data.get('dob')  # Expecting format 'YYYY-MM-DD'
    qualification = data.get('qualification')

    # Ensure only "user" role is allowed
    if role_name != 'user':
        return jsonify({'message': 'Only "user" role is allowed to register'}), 403

    # Check if all necessary fields are provided
    if not all([email, password, full_name, dob_str, qualification]):
        return jsonify({'message': 'All fields are required'}), 400

    # Convert the dob string to a Python date object
    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Check if user already exists
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'message': 'User already exists'}), 400

    try:
        # Fetch the Role object for "user"
        role = Role.query.filter_by(name='user').first()
        if not role:
            return jsonify({'message': 'Role "user" does not exist'}), 400

        # Create the user
        new_user = User(
            email=email,
            password=hash_password(password),
            roles=[role],
            active=True,
            full_name=full_name,
            dob=dob,
            qualification=qualification,
            created_at=datetime.utcnow(),
            fs_uniquifier=str(uuid4()) 
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        print("Error during user creation:", str(e))
        return jsonify({'message': f'Error creating user: {str(e)}'}), 400
    
