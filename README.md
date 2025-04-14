🚧 Work in Progress
### Set up the basic structure of the backend and frontend
- Created a basic **Express.js** server
- Set up a **Next.js** project for the frontend
- Started working on the **API endpoints**
  - Defined routes for getting all movies and getting a single movie by ID
  - (Add any other completed tasks here)  
    - Example: Connected **MongoDB** or started **scraping** movie data (if applicable).

---

## Tasks to Complete

These tasks are simplified to focus on core skills while still building a functional movie streaming website. Each section includes beginner-friendly steps to guide you through the process.

### Integrate MongoDB for Storing Movie Data
- [ ] Set up a **MongoDB** database (e.g., using **MongoDB Atlas**—it's free and cloud-based)
- [ ] Define a simple **schema** for movie information (e.g., just title and description to start)
- [ ] Connect the **Express.js** backend to **MongoDB** using **Mongoose** (a beginner-friendly library)

### Implement Basic API Endpoints for Movie Data
- [ ] Create routes for **creating**, **updating**, and **deleting** movies  
  - (You’ve already done the "Read" operations—great work! Now add the rest of **CRUD**.)

### Develop a Simple Web Scraping Feature
- [ ] Choose a **target website** with movie data (e.g., a simple, static site)
- [ ] Use **Cheerio** to scrape basic movie info (e.g., title, description—Cheerio is easier for beginners than Puppeteer)
- [ ] Store the scraped data in **MongoDB**

### Set Up Basic Video Handling
- [ ] Use **FFmpeg** to generate **thumbnails** for movies (e.g., extract one image per video)
- [ ] Serve the **thumbnails** through the API

### Ensure Frontend Can Fetch and Display Movie Data
- [ ] Set up **data fetching** in **Next.js** using the API endpoints (e.g., with `fetch` or a library like **Axios**)
- [ ] Display the **movie data** on the frontend (e.g., a simple list of titles and thumbnails)

### Test and Debug the Backend
- [ ] Write basic **unit tests** for the API endpoints (e.g., test if the "get movies" route works)
- [ ] **Debug** any issues with the backend or scraping script (e.g., check for errors in the console)

### Update the Readme with Basic Documentation
- [ ] Document the **backend setup** and **API endpoints** (e.g., list the routes and what they do)
- [ ] Include instructions for **running the project** (e.g., `npm install`, `npm start`)

### Implement Basic Security Measures
- [ ] Add **input validation** for API requests (e.g., check that movie titles aren’t empty)
- [ ] Handle errors gracefully (e.g., return a friendly message if something fails)

---

## How to Run the Project

### Prerequisites
- **Node.js** and **npm** installed on your machine.
- Set up a **MongoDB Atlas** account or install MongoDB locally.

### Install Dependencies
```bash
npm install
