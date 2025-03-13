# Goal Guru

Goal Guru is an AI-powered application designed to help students and professionals stay organized, track their goals, and enhance productivity. It uses advanced features such as AI-driven insights, timeline segmentation, and real-time collaboration.

## Features

- **AI-Powered Timeline Segmentation**: Automatically break down videos, lectures, and content into structured sections.
- **Task and Goal Management**: Set and track your goals efficiently.
- **Seamless User Experience**: Built using React (Vite) with MUI Pro for a sleek UI.
- **Interactive Maps**: Integrates OpenLayers with WMTS layers for enhanced mapping capabilities.
- **Offline & Online Support**: Works both as a standalone app (Electron) and an online service.
- **Secure Authentication**: Uses Firebase authentication with Google sign-in.
- **Data Storage & Management**: Utilizes MongoDB and Room for efficient data handling.
- **Dockerized Deployment**: Easily deployable using Docker and Nginx with HTTPS support.

## Tech Stack

- **Frontend**: React (Vite) with MUI Pro & Zustand
- **Backend**: Node.js (Express) with TypeScript
- **Database**: MongoDB & Firebase
- **Mapping**: OpenLayers with WMTS & WebGL rendering
- **Containerization**: Docker & Docker Compose
- **Deployment**: Nginx for serving frontend & backend API

## Installation

### Prerequisites
- **Node.js & npm**
- **Docker & Docker Compose**

### Steps

1. **Clone the repository**
   ```sh
   git clone https://github.com/0123meir/GoalGuru-web.git
   cd goal-guru
   ```
2. **Set up environment variables**
   - Create a `.env` file and configure necessary variables (e.g., API keys, DB URLs)

3. **Run the development server**
   ```sh
   npm install
   npm run dev
   ```

4. **Run with Docker**
   ```sh
   docker-compose up -d
   ```


## License

This project is licensed under the MIT License.

---

🚀 **Goal Guru: Empowering Productivity Through AI & Automation**

