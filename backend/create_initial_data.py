from flask import current_app as app
from models import db, User, Role, Subject, Chapter, Quiz, Question
from flask_security import Security, SQLAlchemyUserDatastore
from datetime import datetime


with app.app_context():
    db.create_all()
    # Create a subject
    subject = Subject(name='Mathematics', description='Mathematics is the study of numbers, quantity, space, structure, and change.')
    db.session.add(subject)
    db.session.commit()
    # Create a chapter
    chapter = Chapter(name='Algebra', description='Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols.')
    chapter.subject = subject
    db.session.add(chapter)
    db.session.commit()
    # Create a quiz
    quiz = Quiz(date_of_quiz=datetime.utcnow(), time_duration='01:30', remarks='This is a sample quiz.')
    quiz.chapter = chapter
    db.session.add(quiz)
    db.session.commit()
    # Create questions
    questions = [
        Question(question_statement='What is the value of x in the equation 2x + 3 = 11?', option1='4', option2='5', option3='6', option4='7', correct_option=3),
        Question(question_statement='What is the value of y in the equation 3y - 5 = 10?', option1='5', option2='6', option3='7', option4='8', correct_option=4)
    ]
    for question in questions:
        question.quiz = quiz
        db.session.add(question)
    db.session.commit()
    # Create a user
    user_datastore : SQLAlchemyUserDatastore = app.security.datastore
    if (not user_datastore.find_user(email='piyushg@gmail.com')):
        user_datastore.create_user( email='piyushg@gmail.com',username='piyushg', password='password', name='Piyush Gupta')
    db.session.commit()