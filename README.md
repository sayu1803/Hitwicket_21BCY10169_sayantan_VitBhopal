# Chess5x5: A Chess-Like Game

## Project Overview

Chess5x5 is a turn-based, chess-like game played on a 5x5 grid. Two players can connect and play the game, moving their pieces according to specific rules, with real-time updates provided via WebSocket communication.

### Features

- **Turn-Based Gameplay**: Players take turns to move their pieces on a 5x5 grid.
- **Real-Time Communication**: The game state is updated in real-time using WebSocket.
- **Multiple Character Types**: Players can choose from different character types, each with unique movement abilities.
- **Game History**: Keeps track of all the moves made during the game.
- **Winning Condition**: The game ends when one player eliminates all of the opponent's characters.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, WebSocket (ws library)
- **Hosting**: Render (Backend), Vercel (Frontend)

## Table of Contents

- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
  - [Running the Server](#running-the-server)
  - [Running the Frontend](#running-the-frontend)
- [Deployment](#deployment)
  - [Deploying the Server](#deploying-the-server)
  - [Deploying the Frontend](#deploying-the-frontend)
- [Gameplay Instructions](#gameplay-instructions)
- [Contributing](#contributing)
- [License](#license)

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v14.x or later
- **npm**: v6.x or later
- **Git**: v2.x or later

### Clone the Repository

Clone this repository to your local machine using:

```bash
git clone https://github.com/sayu1803/Hitwicket_21BCY10169_sayantan_VitBhopal.git
cd Hitwicket_21BCY10169_sayantan_VitBhopal
```

### Install Dependencies

Navigate to the root of your project and install the dependencies for both the backend and frontend:

```bash
# Install server dependencies
npm install
```

### Environment Variables

If your application uses environment variables, you can set them in a `.env` file at the root of your project. Here’s an example:

```bash
PORT=8080
```

## Running the Application

### Running the Server

To start the backend server:

```bash
npm start
```

This will start the Node.js server on the specified port (default is `8080`).

### Running the Frontend

If you're running the frontend locally, you can simply open the `index.html` file in your web browser. Alternatively, you can serve it using a local server.

To serve using a simple Python server:

```bash
cd frontend
python -m http.server 8000
```

Then, navigate to `http://localhost:8000` in your browser.

## Deployment

### Deploying the Server

The backend is deployed using Render.

1. **Sign up or log in to Render**: Go to [Render](https://render.com/).
2. **Create a New Web Service**: Link your GitHub repository and set up your project.
3. **Configure Settings**: Set the build and start commands as follows:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Deploy**: Click "Create Web Service" to deploy your backend.

### Deploying the Frontend

The frontend can be deployed using Vercel.

1. **Sign up or log in to Vercel**: Go to [Vercel](https://vercel.com/).
2. **Import Your GitHub Repository**: Select the repository containing your frontend.
3. **Configure and Deploy**: Vercel will automatically detect your project. Click "Deploy" to go live.

## Gameplay Instructions

1. **Connect**: Open the game in two separate browser windows or devices.
2. **Enter Names**: Both players enter their names.
3. **Place Pieces**: Players place their characters on the grid.
4. **Play**: Take turns moving your pieces according to the rules. The game state will update in real-time.
5. **Winning**: The game ends when one player eliminates all the opponent's pieces.

## Contributing

Contributions are welcome! Please fork the repository, create a new branch for your feature or bugfix, and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

