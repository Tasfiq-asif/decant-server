# Decant Perfume Backend - Docker Setup Guide

This guide explains how to run the Decant Perfume backend server inside a Docker container on any machine.

## Prerequisites

- Docker installed on the target machine
- Access to the project source code (via Git clone or other means)

## Steps to Run

1. **Clone the repository** (if not already done):

   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

docker build -f Dockerfile.dev -t decant-server-dev .

docker run -it --rm \
 --name decant-dev \
 -p 4000:4000 \
 -v $(pwd):/app \
 -v /app/node_modules \
 -e PORT=4000 \
 decant-server-dev
