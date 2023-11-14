FROM python:3.11

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt 

RUN pip install git+https://github.com/openai/whisper.git

COPY . . 

EXPOSE 8888

CMD ["python", "app.py"]