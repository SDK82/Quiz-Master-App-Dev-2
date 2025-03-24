import time
import os
from celery import shared_task
import flask_excel
from backend.models import Score

@shared_task(ignore_result=False)
def add(x, y):
    time.sleep(10)  # Simulate a long running task
    return x + y

@shared_task(ignore_result=False)  # Changed to False to store the result
def generate_csv(self):
    task_id = self.request.id
    filename = f'scores_{task_id}.csv'
    base_dir = os.path.abspath(os.path.dirname(__file__))
    download_dir = os.path.join(base_dir, 'user-downloads')
    os.makedirs(download_dir, exist_ok=True)

    csv_file_path = os.path.join(download_dir, 'scores.csv')

    resource = Score.query.all()
    data = [column.name for column in Score.__table__.columns]

    csv_out = flask_excel.make_response_from_query_sets(resource, column_names=data, file_type='csv')

    with open(csv_file_path, 'wb') as f:
        f.write(csv_out.data)

    return csv_file_path  # Return the file path