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

    # Cache configuration
    CACHE_TYPE = 'RedisCache'
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379
    
    
    WTF_CSRF_ENABLED = False
    