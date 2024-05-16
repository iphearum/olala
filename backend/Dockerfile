FROM python:3.8-slim-buster
FROM python:3.8-slim-buster

WORKDIR /

COPY /requirements.txt requirements.txt
RUN python3 -m venv venv
RUN . venv/bin/activate

RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

RUN pip install -r requirements.txt

CMD [ "python", "-m" , "app"]