# Dockerfile
FROM python:3.9-slim

# Install required libraries
RUN pip install Flask docker

# Set the working directory
WORKDIR /app

# Copy the API server file into the container
COPY app.py /app

# Expose the API port
EXPOSE 8080

# Run the API server
CMD ["python", "app.py"]
