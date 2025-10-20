# Frontend - Khandesh Vivah Portal

React frontend for the Khandesh Vivah marriage portal.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Features

- ✅ Bilingual support (Marathi/English)
- ✅ Responsive design
- ✅ Modern UI with animations
- ✅ User registration with photo upload
- ✅ Profile browsing with filters
- ✅ Admin dashboard
- ✅ JWT authentication

## Project Structure

```
src/
├── components/      # Reusable components
├── context/         # React Context (Auth, Language)
├── pages/           # Page components
├── services/        # API services
├── App.js           # Main app component
└── index.js         # Entry point
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Environment

The app connects to backend at `http://localhost:5000` via proxy configuration.

For production, set `REACT_APP_API_URL` in `.env`:
```
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Routing

- `/` - Home page
- `/register` - User registration
- `/browse` - Browse profiles
- `/profile/:id` - Profile details
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard

## Language Support

Toggle between English and Marathi using the language button in navbar.
Translations are managed in `src/context/LanguageContext.js`.

