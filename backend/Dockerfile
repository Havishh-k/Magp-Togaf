FROM python:3.11-slim

WORKDIR /app

# Install build dependencies for llama-cpp-python and others
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create directories for persistent data
RUN mkdir -p /app/data/models /app/uploads

# Set correct permissions so the app can write to the data volumes
RUN chmod -R 777 /app/data /app/uploads

COPY . .

# Ensure seed script can run before start if necessary
# but usually we handle seeding from compose or entrypoint.
ENV PYTHONPATH=/app

EXPOSE 8000

CMD sh -c "python seed.py && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
