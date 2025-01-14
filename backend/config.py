class Config():
    DEBUG = False 
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class LocalDevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'mysecretvalue'
    SECRET_KEY = 'thisismysecretkey'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authorization-Token'  
    SECURITY_TOKEN_MAX_AGE = 3600
    
    WTF_CSRF_ENABLED = False
    