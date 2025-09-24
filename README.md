# Smart Grid Platform

## Overview

This project is a comprehensive Smart Grid Platform developed as the final year project for a Master's degree in Computer Science at **8 Mai 1945 Guelma University**, with a specialty in **Information and Communication Science and Technology**.

- **Backend:** Developed by @nabilskandar, responsible for designing and implementing the server-side logic, API endpoints, data management, and integration with smart grid systems.
- **Frontend:** Developed by @wailrami, focusing on building an interactive and user-friendly interface that visualizes the data and functionalities provided by the backend.

## Features

- Real-time monitoring and visualization of smart grid data
- User authentication and role management
- Data analytics and reporting tools
- Interactive dashboards and charts
- Secure RESTful API for seamless communication between frontend and backend
- Responsive UI for desktop and mobile devices

## Stack

**Backend:**
- **Language:** Python  
- **Framework:** FastAPI   
- RESTful API

**Frontend:**
- **Framework:** React  
- **Build Tool:** Vite  
- **Styling:** TailwindCSS
- **Charting libraries:** Recharts

## Getting Started

### Prerequisites

- Node.js and npm (for frontend)
- Python 3.x and pip (for backend)


### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/wailrami/smart-grid-plateform.git
    cd smart-grid-plateform
    ```

2. **Backend Setup**
    - Navigate to the backend directory:
      ```bash
      cd backend
      ```
    - Create and activate your virtual environment, then install dependencies:
      ```bash
      python -m venv venv
      source venv/bin/activate  # On Windows: venv\Scripts\activate
      pip install -r requirements.txt
      ```
    - Run the FastAPI server:
      ```bash
      uvicorn main:app --reload
      ```

3. **Frontend Setup**
    - Navigate to the frontend directory:
      ```bash
      cd frontend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Run the development server:
      ```bash
      npm run dev
      ```

4. **Configuration**
    - Configure environment variables for both frontend and backend as required (API URLs, DB credentials, etc.).

## Usage

- Access the frontend via your browser at `http://localhost:5173` (or the specified port).
- Interact with dashboards, manage users, and monitor smart grid data in real time.

## Contributors

- **Backend:** @nabilskandar
- **Frontend:** @wailrami


## Acknowledgements

Special thanks to the faculty and mentors at 8 Mai 1945 Guelma University who supported this project.

