from flask_login import current_user
from flask_restful import Resource, Api, fields, marshal_with, reqparse
from backend.models import db, Subject, Chapter, Question, Quiz, Score
from flask_security import auth_required

api = Api(prefix='/api')

# Marshaling fields
subject_fields = {'id': fields.Integer, 'name': fields.String, 'description': fields.String}
chapter_fields = {'id': fields.Integer, 'name': fields.String, 'description': fields.String, 'subject_id': fields.Integer}
question_fields = {'id': fields.Integer, 'question_statement': fields.String, 'quiz_id': fields.Integer}
quiz_fields = {'id': fields.Integer, 'chapter_id': fields.Integer, 'remarks': fields.String, 'date_of_quiz': fields.DateTime}
score_fields = {'id': fields.Integer, 'quiz_id': fields.Integer, 'user_id': fields.Integer, 'total_score': fields.Float}

# Subject API
class SubjectApi(Resource):
    @auth_required('token')
    @marshal_with(subject_fields)
    def get(self, subject_id=None):
        if subject_id:
            subject = Subject.query.get(subject_id)
            if not subject:
                return {'message': 'Subject not found'}, 404
            return subject
        subjects = Subject.query.all()
        return subjects

    @auth_required('token')
    def delete(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        if any(role.name == 'admin' for role in current_user.roles):
            db.session.delete(subject)
            db.session.commit()
            return {'message': 'Subject deleted'}, 200
        return {'message': 'You are not authorized to delete this subject'}, 403
    
class ChapterApi(Resource):
    @auth_required('token')
    @marshal_with(chapter_fields)
    def get(self, chapter_id=None):
        if chapter_id:
            chapter = Chapter.query.get(chapter_id)
            if not chapter:
                return {'message': 'Chapter not found'}, 404
            return chapter
        chapters = Chapter.query.all()
        return chapters

    @auth_required('token')
    def delete(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {'message': 'Chapter not found'}, 404
        if any(role.name == 'admin' for role in current_user.roles):
            db.session.delete(chapter)
            db.session.commit()
            return {'message': 'Chapter deleted'}, 200
        return {'message': 'You are not authorized to delete this chapter'}, 403
    
class QuestionApi(Resource):
    @auth_required('token')
    @marshal_with(question_fields)
    def get(self, question_id=None):
        if question_id:
            question = Question.query.get(question_id)
            if not question:
                return {'message': 'Question not found'}, 404
            return question
        questions = Question.query.all()
        return questions

    @auth_required('token')
    def delete(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {'message': 'Question not found'}, 404
        if any(role.name == 'admin' for role in current_user.roles):
            db.session.delete(question)
            db.session.commit()
            return {'message': 'Question deleted'}, 200
        return {'message': 'You are not authorized to delete this question'}, 403
    
class QuizApi(Resource):
    @auth_required('token')
    @marshal_with(quiz_fields)
    def get(self, quiz_id=None):
        if quiz_id:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                return {'message': 'Quiz not found'}, 404
            return quiz
        quizzes = Quiz.query.all()
        return quizzes

    @auth_required('token')
    def delete(self, quiz_id):
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
    @marshal_with(score_fields)
    def get(self, score_id=None):
        if score_id:
            score = Score.query.get(score_id)
            if not score:
                return {'message': 'Score not found'}, 404
            return score
        scores = Score.query.all()
        return scores

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


# Registering the resources

api.add_resource(SubjectApi, '/subjects', '/subjects/<int:subject_id>')
api.add_resource(ChapterApi, '/chapters', '/chapters/<int:chapter_id>')
api.add_resource(QuestionApi, '/questions', '/questions/<int:question_id>')
api.add_resource(QuizApi, '/quizzes', '/quizzes/<int:quiz_id>')
api.add_resource(ScoreApi, '/scores', '/scores/<int:score_id>')





