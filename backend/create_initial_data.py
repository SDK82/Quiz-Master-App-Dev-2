from flask import current_app as app
from backend.models import db, User, Role, Subject, Chapter, Quiz, Question
from flask_security import Security, SQLAlchemyUserDatastore
from datetime import datetime


with app.app_context():
    db.create_all()

    # Create roles
    if (not Role.query.filter_by(name='admin').first()):
        admin_role = Role(name='admin', description='Administrator')
        db.session.add(admin_role)
    if (not Role.query.filter_by(name='user').first()):
        user_role = Role(name='user', description='User')
        db.session.add(user_role)
    db.session.commit()
    
    # Create a user
    user_datastore : SQLAlchemyUserDatastore = app.security.datastore
    if (not user_datastore.find_user(email='piyushg@gmail.com')):
        user_datastore.create_user( email='piyushg@gmail.com',username='piyushg', password='password', name='Piyush Gupta')
    db.session.commit()