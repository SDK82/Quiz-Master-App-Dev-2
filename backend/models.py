from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_security import UserMixin ,RoleMixin
import uuid


db = SQLAlchemy()




# Role Table
class Role(db.Model, RoleMixin):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))

# Update User Table to include roles
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    qualification = db.Column(db.String(100))
    dob = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))  # Ensure uniqueness
    active = db.Column(db.Boolean, default=True) # Active users can login


    # Relationships
    scores = db.relationship('Score', backref='user', lazy=True)
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))

# Association Table for User and Role
class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))


# Subject Table
class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    description = db.Column(db.Text)

    # Relationships
    chapters = db.relationship('Chapter', backref='subject', lazy=True)

# Chapter Table
class Chapter(db.Model):
    __tablename__ = 'chapters'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)

    # Relationships
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True)

# Quiz Table
class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id'), nullable=False)
    date_of_quiz = db.Column(db.DateTime, nullable=False)
    time_duration = db.Column(db.String(10))  # e.g., "01:30" for 1 hour 30 mins
    remarks = db.Column(db.Text)

    # Relationships
    questions = db.relationship('Question', backref='quiz', lazy=True)
    scores = db.relationship('Score', backref='quiz', lazy=True)

# Question Table
class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(255), nullable=False)
    option2 = db.Column(db.String(255), nullable=False)
    option3 = db.Column(db.String(255), nullable=False)
    option4 = db.Column(db.String(255), nullable=False)
    correct_option = db.Column(db.Integer, nullable=False)  # 1-4 to indicate the correct answer

# Score Table
class Score(db.Model):
    __tablename__ = 'scores'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    total_score = db.Column(db.Float, nullable=False)

# Admin Table (Pre-defined admin user)
class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False, default='admin')
    password = db.Column(db.String(255), nullable=False, default='admin')

# Initialize the database
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
