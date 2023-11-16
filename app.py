import os
from flask import Flask, flash, request, redirect, url_for, render_template, send_from_directory
from werkzeug.utils import secure_filename
import whisper
import traceback
import sys
from pathlib import Path
import time


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mp3', 'wav', 'avi'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def transcribe(file_path: str, language: str = 'danish', model_size: str = 'large'):
    try:
        print('Indlæser transskriberingsmodel.')
        model = whisper.load_model(model_size)
        if model:
            print(f'Transskriberingsmodel indlæst.')
        print(f'Transskriberer fil: {os.path.basename(file_path)}')
        transcription = model.transcribe(
            file_path, language=language, fp16=False, verbose=True)
        if transcription:
            print('Transskribering færdig.')
        return transcription
    except Exception as e:
        traceback.print_exc()
        print(f'Fejl under transskribering: {e}')
        return None

def float_to_time(float_value: float):
    milliseconds = int((float_value % 1) * 1000)
    seconds = int(float_value % 60)
    minutes = int((float_value // 60) % 60)
    hours = int(float_value // 3600)

    time_str = f'{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}'
    return time_str

def output_to_text_file(data_dict: dict, output_file_name: str):
    index = 1
    try:
        with open(output_file_name, 'w', encoding='utf-8') as file:
            for value in data_dict['segments']:
                start_time_str = float_to_time(value['start'])
                end_time_str = float_to_time(value['end'])
                text = value['text'].strip()
                file.write(f'{index}\n')
                file.write(f'{start_time_str} --> {end_time_str}\n')
                file.write(f'{text}\n\n')
                index += 1
            file.close()

    except Exception as e:
        print(f'Fejl ved skrivning til tekstfil: {e}')


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return render_template('error.html', error="Fil mangler")
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return render_template('error.html', error="Ingen fil valgt")
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            base = Path(os.path.join(app.config['UPLOAD_FOLDER'], filename)).stem
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            transcription = transcribe(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            if transcription:
                output_to_text_file(transcription, os.path.join(app.config['UPLOAD_FOLDER'], base + '.srt') )

                response = send_from_directory(app.config['UPLOAD_FOLDER'], (base + '.srt'), as_attachment=True, download_name=f"{base}.srt")
            
        return response
    return '''
    <!doctype html>
    <h1>Upload ny fil</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)