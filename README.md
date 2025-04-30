# Data Visualization with Lida Library

This project allows users to upload CSV or Excel data and generate charts based on that data. The application is built with the following technologies:

- **Frontend:** Next.js, TailwindCSS
- **Backend:** FastAPI (Python)
- **Data Visualization:** Lida Library

## Features
- Upload CSV or Excel files.
- Visualize data in chart form using the Lida library.
- Generate interactive and responsive charts.
- Simple and intuitive user interface.

## Tech Stack
- **Frontend:** 
  - Next.js
  - TailwindCSS
- **Backend:** 
  - Python FastAPI
  - Lida (for data visualization)

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (for Next.js frontend)
- **Python** (for FastAPI backend)
- **pip** (Python package installer)

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/sha-linimoorthy/Lida-HF.git
cd Lida-HF
```

### Step 2: Install Frontend Dependencies (Next.js)

Navigate to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

### Step 3: Install Backend Dependencies (FastAPI)

Navigate to the backend folder and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Start the Backend Server

To start the FastAPI backend server, run the following command:

```bash
cd backend
uvicorn main:app --port 3333
```

This will start the FastAPI server at `http://127.0.0.1:3333`.

### Step 5: Start the Frontend Server

To start the Next.js frontend server, run the following command:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:2222`.

### Step 6: Upload Data and Generate Chart

1. **Open the Frontend Application** in your browser: `http://localhost:2222`.
2. **Upload a CSV or Excel file** by clicking the "Upload File" button.
3. **Select your file**, and the backend will process the data and return a visualization.
4. **View the generated chart** based on the data in the file.

The chart will be rendered using Lida, which will generate visualizations based on the columns and data you upload.

### Step 7: Customize Chart Types

You can modify the chart rendering behavior by adjusting the visualization options in the frontend (e.g., bar chart, line chart, pie chart).

## Contributing

If you'd like to contribute to the project:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes and commit (`git commit -am 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Feel free to open issues or submit pull requests. Happy coding! 😎

