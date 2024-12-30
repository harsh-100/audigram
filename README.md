# AudioGram

A social platform for sharing and discovering audio content. Users can upload audio clips, interact with other users' content through likes and comments, and follow their favorite creators.

## Features

- User authentication (register, login, logout)
- Audio upload and playback
- Interactive waveform visualization
- Like and comment on audio posts
- Follow other users
- User profiles
- Responsive design
- Beautiful gradient animations

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- SQLite database
- JWT authentication
- Multer for file uploads

### Frontend
- React with TypeScript
- Material-UI components
- Tailwind CSS for styling
- WaveSurfer.js for audio visualization
- React Router for navigation
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js >= 18.18.0
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/audigram.git
cd audigram
```

2. Install dependencies:
```bash
npm run install-deps
```

3. Set up the backend:
```bash
cd backend
# Create a .env file with the following content:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your-super-secret-key-change-in-production"
# PORT=5000

# Run migrations
npx prisma migrate dev
```

4. Start the development servers:
```bash
# From the root directory
npm start
```

The backend will run on http://localhost:5000 and the frontend on http://localhost:5173.

## Project Structure

```
audigram/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   └── uploads/
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── contexts/
        ├── pages/
        └── App.tsx
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 