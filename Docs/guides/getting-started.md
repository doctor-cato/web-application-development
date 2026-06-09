# Getting Started

Follow this guide to get 3HD2Kcinema running on your local machine. Since the application is built entirely using vanilla HTML, CSS, and JS, there is no server compilation or database setup required.

---

## Prerequisites

Ensure you have the following before proceeding:
- A modern web browser (e.g., Chrome, Edge, Safari, Firefox)
- Git (optional, for repository management)

---

## Running the Application Locally

You can run the application using two methods:

### Method 1: Local Server (Recommended)
Running a lightweight static file server avoids potential browser security restrictions (CORS) with ES6 Module imports.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/githubuser2777/3dh2k-cinema.git
   cd 3dh2k-cinema
   ```

2. **Start a static server:**
   - **Using VS Code**: Install the **Live Server** extension, open the project workspace, and click **Go Live** at the bottom-right corner.
   - **Using npm (Node.js)**: If you have Node installed, run:
     ```bash
     npx serve
     ```
     This serves the project immediately on `http://localhost:3000`.
   - **Using Python**:
     ```bash
     python -m http.server 8000
     ```
     Open `http://localhost:8000` in your browser.

### Method 2: Direct File Loading (Double-Click)
- You can double-click `index.html` to open it directly. However, note that ES6 modules (`type="module"`) require a local HTTP server context to load sub-scripts properly in many modern browsers.

---

## Database Reset & Data Seeding

* On the first page load, the application seeds default movie, room, and showtime listings into `LocalStorage`.
* To reset the application data to its initial clean state, open the browser's developer console (F12) and run:
  ```javascript
  localStorage.clear();
  location.reload();
  ```

---

## Next Steps

Once the app is running:
- See the [Development Guide](development.md) for instructions on styling and coding custom JS services.
- Explore the [Architecture Overview](../architecture/overview.md) to understand how client-side modules and BroadcastChannel coordinate real-time states.
