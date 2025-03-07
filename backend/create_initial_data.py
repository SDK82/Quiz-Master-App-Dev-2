from flask import current_app as app
from backend.models import db, User, Role, Subject, Chapter, Quiz, Question
from flask_security import Security, SQLAlchemyUserDatastore
from datetime import datetime


with app.app_context():
    db.create_all()
    # Check if the subject already exists
    subject = Subject.query.filter_by(name='Mathematics').first()
    if not subject:
        # Create a subject if it doesn't exist
        subject = Subject(
            name='Mathematics',
            description='Mathematics is the study of numbers, quantity, space, structure, and change.'
        )
        db.session.add(subject)
        db.session.commit()

    # Check if the chapter already exists
    chapter = Chapter.query.filter_by(name='Algebra', subject_id=subject.id).first()
    if not chapter:
        # Create a chapter if it doesn't exist
        chapter = Chapter(
            name='Algebra',
            description='Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols.',
            subject_id=subject.id
        )
        db.session.add(chapter)
        db.session.commit()

    # Check if the quiz already exists
    quiz = Quiz.query.filter_by(remarks='This is a sample quiz.', chapter_id=chapter.id).first()
    if not quiz:
        # Create a quiz if it doesn't exist
        quiz = Quiz(
            date_of_quiz=datetime.utcnow(),
            time_duration='01:30',
            remarks='This is a sample quiz.',
            chapter_id=chapter.id,
            created_at=datetime.utcnow(),
            difficulty='Medium'
    
        )
        db.session.add(quiz)
        db.session.commit()

    # Check if the questions already exist
    existing_questions = Question.query.filter_by(quiz_id=quiz.id).all()
    if not existing_questions:
        # Create questions if they don't exist
        questions = [
            Question(
                question_statement='What is the value of x in the equation 2x + 3 = 11?',
                option1='4', option2='5', option3='6', option4='7',
                correct_option=3,
                quiz_id=quiz.id
            ),
            Question(
                question_statement='What is the value of y in the equation 3y - 5 = 10?',
                option1='5', option2='6', option3='7', option4='8',
                correct_option=4,
                quiz_id=quiz.id
            )
        ]
        db.session.add_all(questions)
        db.session.commit()

# Create roles
admin_role = Role.query.filter_by(name='admin').first()
if not admin_role:
    admin_role = Role(name='admin', description='Administrator')
    db.session.add(admin_role)

user_role = Role.query.filter_by(name='user').first()
if not user_role:
    user_role = Role(name='user', description='User')
    db.session.add(user_role)

db.session.commit()

# Create a user
user_datastore: SQLAlchemyUserDatastore = app.security.datastore
if not user_datastore.find_user(email='piyush@gmail.com'):
    user_datastore.create_user(
        email='piyush@gmail.com',
        password='password',
        full_name='Piyush Gupta',
        roles=[user_role]  # Now user_role is defined
    )
if not user_datastore.find_user(email='admin@gmail.com'):
    user_datastore.create_user(
        email='admin@gmail.com',
        password='admin',
        full_name='Admin',
        roles=[admin_role]  # Now admin_role is defined
    )
db.session.commit()