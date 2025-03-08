from flask import Flask , request, jsonify
from backend.config import LocalDevelopmentConfig
from backend.models import db
from backend.models import User, Role
from flask_security import Security, SQLAlchemyUserDatastore
from flask_caching import Cache
from backend.celery.celery_factory import celery_init_app
from werkzeug.utils import secure_filename
import os

def create_app():
    app = Flask(__name__  ,template_folder='frontend', static_folder='frontend', static_url_path='/static')

    UPLOAD_FOLDER = 'uploads/subjects'
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the folder exists
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER    
                       
    app.config.from_object(LocalDevelopmentConfig)
    app.config['SECURITY_TRACKABLE'] = True
    db.init_app(app)
    cache = Cache(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.cache = cache
    app.security =  Security(app, datastore, register_blueprint=False) 
    app.app_context().push()
    from backend.resources import api
    api.init_app(app)


    app.config['SQLALCHEMY_ECHO'] = True

    return app

app = create_app()

celery_app = celery_init_app(app)


import backend.create_initial_data



import backend.routes

if __name__ == '__main__':
    app.run(debug=True)
