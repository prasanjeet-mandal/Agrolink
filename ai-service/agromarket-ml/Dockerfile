FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api ./api
COPY services ./services
COPY src ./src

COPY models/arrival_global_clean ./models/arrival_global_clean
COPY models/demand ./models/demand

EXPOSE 8000

CMD ["uvicorn","api.main:app","--host","0.0.0.0","--port","8000"]
