from uuid import uuid4
from flask import current_app as app, jsonify, render_template, request, send_file, send_from_directory
from backend.models import db, User, Role
from flask_security import auth_required, login_required, current_user, login_user
from flask_security.utils import verify_password, hash_password
from datetime import datetime
from backend.celery.tasks import add, generate_csv
from celery.result import AsyncResult
import os

datastore = app.security.datastore
cache = app.cache

@app.get('/')
def hello():
    return render_template('index.html')

@app.route('/test')
@auth_required()
def test():
    return 'Test for only authenticated users'

@app.get('/cache')
@cache.cached(timeout=10)
def cache():
    return {'time': str(datetime.now())}

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id': task.id}

@app.get('/get-celery-data/<id>')
def getData(id):
    result = AsyncResult(id)
    if result.ready():
        return {'result': result.result}, 200
    else:
        return {'status': 'Task not ready'}, 405

@app.route('/create_csv')
def create_csv():
    task = generate_csv.delay()
    print(f"Task {task.id} queued")
    return jsonify({'task_id': task.id, 'state': task.state}), 200

@app.get('/download_csv/<task_id>')
def download_csv(task_id):
    result = AsyncResult(task_id)
    print(f"Task {task_id} ready: {result.ready()}")
    
    if not result.ready():
        print(f"Task {task_id} state: {result.state}")
        return jsonify({'status': 'Task not ready', 'state': result.state}), 405

    file_path = result.result
    print(f"Task {task_id} result: {file_path}")
    if not os.path.exists(file_path):
        return jsonify({'status': 'File not found', 'file_path': file_path}), 404

    return send_file(file_path, as_attachment=True, download_name='scores.csv')

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
        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email,
            'role': user.roles[0].name if user.roles else 'user',
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
    dob_str = data.get('dob')
    qualification = data.get('qualification')

    if role_name != 'user':
        return jsonify({'message': 'Only "user" role is allowed to register'}), 403

    if not all([email, password, full_name, dob_str, qualification]):
        return jsonify({'message': 'All fields are required'}), 400

    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'message': 'User already exists'}), 400

    try:
        role = Role.query.filter_by(name='user').first()
        if not role:
            return jsonify({'message': 'Role "user" does not exist'}), 400

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

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')