# Door Control System - Backend and Frontend

A complete door access control system with Node.js backend, responsive web frontend and ESP32 firmware.

## About the Project

This is an integrated IoT system that allows remote control of doors through an intuitive web interface. The system consists of three main components:

- Backend: API in Node.js for access control management
- Frontend: Web interface to monitor and control doors
- ESP32 Firmware: Embedded code to control devices remotely

## Technologies Used

- Backend: Node.js, Express
- Frontend: HTML, CSS, JavaScript
- Microcontroller: ESP32 (C++)
- Communication: REST API, Wi-Fi

## Project Structure

```
Door-Control-System-Backend-and-Frontend/
├── esp32/              # Firmware code for ESP32
├── src/                # Backend source code
│   └── models/         # Data models
├── public/             # Frontend static files
├── app.js              # Main backend file
├── package.json        # Node.js dependencies
└── LICENSE             # MIT License
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Arduino IDE (to program the ESP32)
- ESP32 board

### Installation

1. Clone the repository
```bash
git clone https://github.com/cyberdebb/Door-Control-System-Backend-and-Frontend.git
cd Door-Control-System-Backend-and-Frontend
```

2. Install backend dependencies
```bash
npm install
```

3. Configure environment variables
```bash
# Create a .env file with the necessary settings
```

4. Start the backend server
```bash
npm start
# or
node app.js
```

The server will be available at `http://localhost:3000` (or the configured port)

### ESP32 Configuration

1. Open Arduino IDE
2. Navigate to the `esp32/` folder
3. Open the main file (.ino)
4. Configure Wi-Fi credentials in the code
5. Select the ESP32 board and COM port
6. Upload the code

## Features

- Web interface for door control
- Real-time communication with ESP32
- RESTful API for integration
- User and permission management
- Access history
- Responsive design

## API Endpoints

Basic documentation of available endpoints. For more details, consult the code in `app.js`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serves the frontend |
| POST | `/api/door/unlock` | Unlocks the door |
| POST | `/api/door/lock` | Locks the door |
| GET | `/api/status` | Gets system status |

Add more endpoints as needed for your project.

## Security

- The application uses HTTPS in production (recommended)
- Sensitive credentials should be stored in environment variables
- Implement authentication and authorization before deployment
- Never expose credentials in code

## Port Configuration

By default, the application runs on port 3000. To change it, modify the `PORT` environment variable:

```bash
PORT=5000 node app.js
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more details.
