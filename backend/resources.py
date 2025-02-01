from flask_login import current_user
from flask_restful import Resource, Api, fields, marshal_with, reqparse
from backend.models import db, Subject, Chapter, Question, Quiz, Score
from flask_security import auth_required
from flask import current_app as app, request
from datetime import datetime

cache = app.cache

api = Api(prefix='/api')

# Marshaling fields




api = Api(prefix='/api')


# Marshaling fields
subject_fields = {'id': fields.Integer, 'name': fields.String, 'description': fields.String}
chapter_fields = {'id': fields.Integer, 'name': fields.String, 'description': fields.String, 'subject_id': fields.Integer, 'subject_name': fields.String,    'no_of_questions': fields.Integer}
question_fields = {
    'id': fields.Integer,
    'question_statement': fields.String,
    'option1': fields.String,
    'option2': fields.String,
    'option3': fields.String,
    'option4': fields.String,
    'correct_option': fields.Integer,
    'quiz_id': fields.Integer,
    'time_duration': fields.String,
}
quiz_fields = {'id': fields.Integer, 'chapter_id': fields.Integer, 'remarks': fields.String, 'date_of_quiz': fields.DateTime, 'time_duration': fields.String , 'chapter_name': fields.String}
score_fields = {'id': fields.Integer, 'quiz_id': fields.Integer, 'user_id': fields.Integer, 'total_score': fields.Float}

# Subject API
class SubjectApi(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(subject_fields)
    def get(self, subject_id=None):
        if subject_id:
            subject = Subject.query.get(subject_id)
            if not subject:
                return {'message': 'Subject not found'}, 404
            return subject
        return Subject.query.all()

    @auth_required('token')
    def post(self):
        if any(role.name == 'admin' for role in current_user.roles):
            parser = reqparse.RequestParser()
            parser.add_argument('name', required=True, help='Name is required')
            parser.add_argument('description', required=True, help='Description is required')
            args = parser.parse_args()

            new_subject = Subject(name=args['name'], description=args['description'])
            db.session.add(new_subject)
            db.session.commit()
            return {'message': 'Subject created successfully'}, 201
        return {'message': 'You are not authorized to create subjects'}, 403

    @auth_required('token')
    def delete(self, subject_id):
        if not subject_id:
            return {'message': 'Subject ID is required'}, 400
        subject = Subject.query.get(subject_id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        if any(role.name == 'admin' for role in current_user.roles):
            db.session.delete(subject)
            db.session.commit()
            return {'message': 'Subject deleted'}, 200
        return {'message': 'You are not authorized to delete this subject'}, 403


# Chapter API
class ChapterApi(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(chapter_fields)

    def get(self, id=None):
        if id:
            # New endpoint to get chapters by subject ID
            chapters = Chapter.query.filter_by(subject_id=id).all()
            if not chapters:
                return {'message': 'No chapters found for the given subject'}, 404
            return [{
                "id": chapter.id,
                "name": chapter.name,
                "description": chapter.description,
                "subject_name": chapter.subject.name,  # Assuming a relationship exists
                "no_of_questions": len(chapter.quizzes)  # ✅ Add question count

            } for chapter in chapters], 200

        # Original functionality for getting all chapters
        return Chapter.query.all()

    @auth_required('token')
    def post(self):
        if any(role.name == 'admin' for role in current_user.roles):
            parser = reqparse.RequestParser()
            parser.add_argument('name', required=True, help='Name is required')
            parser.add_argument('description', required=True, help='Description is required')
            parser.add_argument('subject_id', required=True, help='Subject ID is required', type=int)
            args = parser.parse_args()

            new_chapter = Chapter(name=args['name'], description=args['description'], subject_id=args['subject_id'])
            db.session.add(new_chapter)
            db.session.commit()
            return {'message': 'Chapter created successfully'}, 201
        return {'message': 'You are not authorized to create chapters'}, 403
    
    @auth_required('token')
    def delete(self, chapter_id):
        if not chapter_id:
            return {'message': 'Chapter ID is required'}, 400
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {'message': 'Chapter not found'}, 404
        if any(role.name == 'admin' for role in current_user.roles):
            db.session.delete(chapter)
            db.session.commit()
            return {'message': 'Chapter deleted'}, 200
        return {'message': 'You are not authorized to delete this chapter'}, 403


# Question API
class QuestionApi(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(question_fields)
    def get(self, question_id=None):
        if question_id:
            question = Question.query.get(question_id)
            if not question:
                return {'message': 'Question not found'}, 404
            return question
        return Question.query.all()

    @auth_required('token')
    def post(self):
        if any(role.name == 'admin' for role in current_user.roles):
            parser = reqparse.RequestParser()
            parser.add_argument('question_statement', required=True, help='Question statement is required')
            parser.add_argument('option1', required=True, help='Option 1 is required')
            parser.add_argument('option2', required=True, help='Option 2 is required')
            parser.add_argument('option3', required=True, help='Option 3 is required')
            parser.add_argument('option4', required=True, help='Option 4 is required')
            parser.add_argument('correct_option', required=True, help='Correct option is required', type=int)
            parser.add_argument('quiz_id', required=True, help='Quiz ID is required', type=int)
            args = parser.parse_args()

            new_question = Question(
                question_statement=args['question_statement'],
                option1=args['option1'],
                option2=args['option2'],
                option3=args['option3'],
                option4=args['option4'],
                correct_option=args['correct_option'],
                quiz_id=args['quiz_id'],
            )
            db.session.add(new_question)
            db.session.commit()
            return {'message': 'Question created successfully'}, 201
        return {'message': 'You are not authorized to create questions'}, 403
    
    @auth_required('token')
    def delete(self, question_id):
        if not question_id:
            return {'message': 'Question ID is required'}, 400
        question = Question.query.get(question_id)
        if not question:
            return {'message': 'Question not found'}, 404
        if any(role.name == 'admin' for role in current_user.roles):
            db.session.delete(question)
            db.session.commit()
            return {'message': 'Question deleted'}, 200
        return {'message': 'You are not authorized to delete this question'}, 403


# Quiz API
class QuizApi(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(quiz_fields)
    def get(self, chapter_id=None):
        """
        Retrieve quizzes by chapter ID.
        """
        if not chapter_id:
            return {'message': 'Chapter ID is required'}, 400

        quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
        if not quizzes:
            return {'message': 'No quizzes found for the given chapter'}, 404

        return [
            {
                "id": quiz.id,
                "chapter_id": quiz.chapter_id,
                "chapter_name": quiz.chapter.name,  # Ensure relationship exists in models
                "date_of_quiz": quiz.date_of_quiz,
                "time_duration": quiz.time_duration,
                "remarks": quiz.remarks,
            }
            for quiz in quizzes
        ], 200



    @auth_required('token')
    def post(self):
        if any(role.name == 'admin' for role in current_user.roles):
            parser = reqparse.RequestParser()
            parser.add_argument('chapter_id', required=True, help='Chapter ID is required', type=int)
            parser.add_argument('remarks', required=True, help='Remarks are required')
            parser.add_argument('date_of_quiz', required=True, help='Date of quiz is required', type=str)
            args = parser.parse_args()

            new_quiz = Quiz(chapter_id=args['chapter_id'], remarks=args['remarks'], date_of_quiz=args['date_of_quiz'])
            db.session.add(new_quiz)
            db.session.commit()
            return {'message': 'Quiz created successfully'}, 201
        return {'message': 'You are not authorized to create quizzes'}, 403
    
    @auth_required('token')
    def delete(self, quiz_id):
        if not quiz_id:
            return {'message': 'Quiz ID is required'}, 400
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        if any(role.name == 'admin' for role in current_user.roles):
            db.session.delete(quiz)
            db.session.commit()
            return {'message': 'Quiz deleted'}, 200
        return {'message': 'You are not authorized to delete this quiz'}, 403


    
class ScoreApi(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(score_fields)
    def get(self, user_id):
        scores = Score.query.filter_by(user_id=user_id).all()
        if not scores:
            return {'message': 'No scores found for this user'}, 404
        return scores, 200

    

    @auth_required('token')
    def delete(self, score_id):
        score = Score.query.get(score_id)
        if not score:
            return {'message': 'Score not found'}, 404
        if any(role.name == 'admin' for role in current_user.roles):
            db.session.delete(score)
            db.session.commit()
            return {'message': 'Score deleted'}, 200
        return {'message': 'You are not authorized to delete this score'}, 403

    @auth_required('token')
    def post(self):
        if not request.is_json:
            return {'message': 'Request body must be JSON'}, 400

        data = request.get_json()
        print("Received data:", data)  # Debugging

        try:
            # Convert quiz_id and user_id to integers
            quiz_id = int(data.get('quiz_id'))
            user_id = int(data.get('user_id'))
            total_score = float(data.get('total_score'))  # Ensure float

            # Validate required fields
            if quiz_id is None or user_id is None or total_score is None:
                return {'message': 'Missing required fields'}, 400

            # Create and save new score
            new_score = Score(quiz_id=quiz_id, user_id=user_id, total_score=total_score)
            db.session.add(new_score)
            db.session.commit()

            return {'message': 'Score saved successfully!', 'score_id': new_score.id}, 201

        except ValueError as e:
            print("Error converting data types:", str(e))  # Debugging
            return {'message': 'Invalid data format'}, 400
        except Exception as e:
            db.session.rollback()
            print("Error saving score:", str(e))  # Debugging
            return {'message': 'An error occurred while saving the score'}, 500

    

class QuizQuestionsApi(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(question_fields)
    def get(self, quiz_id):
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        quiz = Quiz.query.get(quiz_id)
        if not questions:
            return {'message': 'No questions found for this quiz'}, 404
        return questions,quiz, 200
    
    
    

# Registering the resources

api.add_resource(SubjectApi, '/subjects', '/subjects/<int:subject_id>')
api.add_resource(ChapterApi, '/chapters', '/chapters/<int:chapter_id>', '/subjects/<int:id>/chapters')
api.add_resource(QuizQuestionsApi, '/quizzes/<int:quiz_id>/questions')
api.add_resource(QuizApi, '/quizzes', '/quizzes/<int:quiz_id>', '/chapter/<int:chapter_id>/quizzes')
api.add_resource(ScoreApi, '/scores', '/scores/<int:user_id>')





