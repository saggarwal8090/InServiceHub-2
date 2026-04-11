# InServiceHub Local Deployment Guide (SQLite)

This guide details how to run InServiceHub locally using SQLite.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (v3.10+)

## Setup Steps

### 1. Backend (Node.js)

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Initialize the SQLite database:
    ```bash
    node db/init_sqlite.js
    ```
    This will create a `inservicehub.db` file in the project root.

4.  Start the server:
    ```bash
    npm start
    ```
    The server will run on [http://localhost:5001](http://localhost:5001).

### 2. Analytics Service (FastAPI)

1.  Navigate to the `fastapi_service` directory in a new terminal:
    ```bash
    cd fastapi_service
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the service:
    ```bash
    python -m uvicorn main:app --reload --port 8000
    ```
    The API will be available at [http://localhost:8000](http://localhost:8000).

## Verification

-   Visit [http://localhost:5001](http://localhost:5001) to use the application.
-   The frontend is served by the Node.js server.
-   Data is stored in `inservicehub.db`.
