from flask_login import current_user
from flask_restful import Resource, Api, fields, marshal_with, reqparse
from backend.models import db, User, Subject, Chapter, Question, Quiz, Score
from flask_security import auth_required
from flask import current_app as app, request
from werkzeug.security import generate_password_hash
from datetime import datetime


cache = app.cache

api = Api(prefix='/api')


import os
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
UPLOAD_FOLDER = 'uploads/subjects'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Marshaling fields
account_fields = {'id': fields.Integer, 'email': fields.String, 'full_name': fields.String, 'roles': fields.List(fields.String), 'password': fields.String, 'qualification': fields.String, 'dob': fields.String, 'created_at': fields.DateTime}
subject_fields = {'id': fields.Integer, 'name': fields.String, 'description': fields.String, 'image': fields.String}
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
quiz_fields = {'id': fields.Integer, 'chapter_id': fields.Integer, 'remarks': fields.String, 'date_of_quiz': fields.DateTime, 'time_duration': fields.String , 'chapter_name': fields.String, 'no_of_questions': fields.Integer, 'difficulty': fields.String, 'created_at': fields.DateTime}
score_fields = {'id': fields.Integer, 'quiz_id': fields.Integer, 'user_id': fields.Integer, 'total_score': fields.Float, 'timestamp': fields.DateTime, 'time_taken': fields.Integer}

# Subject API
from flask import request
from werkzeug.utils import secure_filename
import os

class AccountApi(Resource):
    @auth_required('token')
    @marshal_with(account_fields)
    def get(self, id=None):
        if id:
            account = User.query.get(id)
            if not account:
                return {'message': 'Account not found'}, 404
            return account
        
    def put(self, id):
        parser = reqparse.RequestParser()
        parser.add_argument('email', required=False)
        parser.add_argument('full_name', required=False)
        parser.add_argument('qualification', required=False)
        parser.add_argument('dob', required=False)
        parser.add_argument('password', required=False)
        parser.add_argument('confirm_password', required=False)
        args = parser.parse_args()

        account = User.query.get(id)
        if not account:
            return {'message': 'Account not found'}, 404

        try:
            # Update only provided fields
            if args['email']:
                account.email = args['email']
            if args['full_name']:
                account.full_name = args['full_name']
            if args['qualification']:
                account.qualification = args['qualification']
            if args['dob']:
                account.dob = args['dob']

            # Handle password change separately
            if args['password']:
                if args['password'] != args['confirm_password']:
                    return {'message': 'Passwords do not match'}, 400
                account.password = generate_password_hash(args['password'])  # Hash the password

            db.session.commit()
            return {'message': 'Account updated successfully'}, 200
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return {'message': f'An error occurred: {str(e)}'}, 500
    
    def delete(self, id):
        account = User.query.get(id)
        if not account:
            return {'message': 'Account not found'}, 404
        db.session.delete(account)
        db.session.commit()
        return {'message': 'Account deleted'}, 200
        
# def put(self, id):
#     parser = reqparse.RequestParser()
#     parser.add_argument('email', required=False)
#     parser.add_argument('full_name', required=False)
#     parser.add_argument('qualification', required=False)
#     parser.add_argument('dob', required=False)
#     parser.add_argument('password', required=False)
#     parser.add_argument('confirm_password', required=False)
#     args = parser.parse_args()

#     account = User.query.get(id)
#     if not account:
#         return {'message': 'Account not found'}, 404

#     # Update only provided fields
#     if args['email']:
#         account.email = args['email']
#     if args['full_name']:
#         account.full_name = args['full_name']
#     if args['qualification']:
#         account.qualification = args['qualification']
#     if args['dob']:
#         account.dob = args['dob']

#     # Handle password change separately
#     if args['password']:
#         if args['password'] != args['confirm_password']:
#             return {'message': 'Passwords do not match'}, 400
#         account.password = generate_password_hash(args['password'])  # Hash the password

#     db.session.commit()
#     return {'message': 'Account updated successfully'}, 200

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
            # Parse form data
            name = request.form.get('name')
            description = request.form.get('description')

            if not name or not description:
                return {'message': 'Name and description are required'}, 400

            # Handle image upload
            image_file = request.files.get('image')
            image_filename = None

            if image_file:
                # Ensure the filename is secure
                filename = secure_filename(image_file.filename)
                # Save the file to the upload folder
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                image_file.save(image_path)
                # Store the relative URL path
                image_filename = f"/uploads/subjects/{filename}"

            # Create a new subject
            new_subject = Subject(
                name=name,
                description=description,
                image=image_filename  # This will now work
            )
            db.session.add(new_subject)
            db.session.commit()

            return {
                'message': 'Subject created successfully',
                'image_url': image_filename
            }, 201
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
                return [], 200 
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
    def put(self, chapter_id):
        if any(role.name == 'admin' for role in current_user.roles):
            parser = reqparse.RequestParser()
            parser.add_argument('name', required=True, help='Name is required')
            parser.add_argument('description', required=True, help='Description is required')
            args = parser.parse_args()

            # Find the chapter by ID
            chapter = Chapter.query.get(chapter_id)
            if not chapter:
                return {'message': 'Chapter not found'}, 404

            # Update chapter details
            chapter.name = args['name']
            chapter.description = args['description']
            db.session.commit()

            return {'message': 'Chapter updated successfully'}, 200
        return {'message': 'You are not authorized to update chapters'}, 403
    
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
    def get(self, chapter_id=None, quiz_id=None):
        if quiz_id:
            quiz = Quiz.query.get_or_404(quiz_id)
            print(f"Quiz {quiz.id} has {len(quiz.questions)} questions")  # Debugging
            return quiz
        elif chapter_id:
            quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()

            return [
                {
                    "id": quiz.id,
                    "chapter_id": quiz.chapter_id,
                    "chapter_name": quiz.chapter.name,
                    "date_of_quiz": quiz.date_of_quiz,
                    "time_duration": quiz.time_duration,
                    "remarks": quiz.remarks,
                    "no_of_questions": len(quiz.questions),  
                    "difficulty": quiz.difficulty,
                    "created_at": quiz.created_at,
                }
                for quiz in quizzes
            ], 200



    @auth_required('token')
    def post(self):
        data = request.get_json()

        try:
            # Convert date_of_quiz to datetime object
            date_of_quiz = datetime.strptime(data['date_of_quiz'], "%Y-%m-%d %H:%M:%S")

            new_quiz = Quiz(
                chapter_id=data['chapter_id'],
                date_of_quiz=date_of_quiz,
                time_duration=data['time_duration'],
                remarks=data['remarks'],
                difficulty=data['difficulty'],  

            )

            db.session.add(new_quiz)
            db.session.commit()

            return {"message": "Quiz created successfully", "id": new_quiz.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating quiz: {str(e)}"}, 400
    
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
    def get(self, user_id):
        scores = (
            db.session.query(
                Score.id, Score.total_score, Score.time_taken, Score.timestamp,
                Score.max_score,  # Include max_score
                Quiz.id.label("quiz_id"), Chapter.name.label("chapter_name"), 
                Subject.name.label("subject_name")
            )
            .join(Quiz, Score.quiz_id == Quiz.id)
            .join(Chapter, Quiz.chapter_id == Chapter.id)
            .join(Subject, Chapter.subject_id == Subject.id)
            .filter(Score.user_id == user_id)
            .all()
        )

        if not scores:
            return {'message': 'No scores found for this user'}, 404

        return [
            {
                "id": score.id,
                "subject_name": score.subject_name,
                "chapter_name": score.chapter_name,
                "total_score": score.total_score,
                "max_score": score.max_score, 
                "time_taken": score.time_taken,
                "timestamp": score.timestamp.strftime("%Y-%m-%d %H:%M:%S") if score.timestamp else None,
            }
            for score in scores
        ], 200


    

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

        try:
            quiz_id = int(data.get('quiz_id'))
            user_id = int(data.get('user_id'))
            total_score = float(data.get('total_score'))
            time_taken = int(data.get('time_taken'))

            # Get max score by counting questions in the quiz
            max_score = Question.query.filter_by(quiz_id=quiz_id).count()

            new_score = Score(
                quiz_id=quiz_id,
                user_id=user_id,
                total_score=total_score,
                time_taken=time_taken,
                max_score=max_score  # Set max score
            )

            db.session.add(new_score)
            db.session.commit()

            return {
                'message': 'Score saved successfully!',
                'score_id': new_score.id,
                'max_score': max_score  # Return max score
            }, 201

        except ValueError as e:
            logger.error(f"Data conversion error: {str(e)}")
            return {'message': 'Invalid data format'}, 400
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error: {str(e)}")
            return {'message': 'An error occurred while saving the score'}, 500


    

class QuizQuestionsApi(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(question_fields)
    def get(self, quiz_id):
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        if not questions:
            return {'message': 'No questions found for this quiz'}, 404
        return questions, 200
    @auth_required('token')
    def post(self):
        data = request.get_json()

        new_question = Question(
            quiz_id=data["quiz_id"],  # Ensure the frontend sends this!
            question_statement=data["question_statement"],
            option1=data["option1"],
            option2=data["option2"],
            option3=data["option3"],
            option4=data["option4"],
            correct_option=data["correct_option"],
        )

        db.session.add(new_question)
        db.session.commit()

        return {"message": "Question added successfully!", "id": new_question.id}, 201
    
    
    

# Registering the resources

api.add_resource(SubjectApi, '/subjects', '/subjects/<int:subject_id>')
api.add_resource(ChapterApi, '/chapters', '/chapters/<int:chapter_id>', '/subjects/<int:id>/chapters')
api.add_resource(QuizQuestionsApi, '/quizzes/<int:quiz_id>/questions','/questions')
api.add_resource(QuizApi, '/quizzes', '/quizzes/<int:quiz_id>', '/chapter/<int:chapter_id>/quizzes')
api.add_resource(ScoreApi, '/scores', '/scores/<int:user_id>')
api.add_resource(AccountApi, '/account', '/account/<int:id>')





