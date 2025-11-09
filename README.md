# Eye Glaze - Stress Detection System

Eye Glaze is a sophisticated web application that uses eye analysis to detect stress levels in users. Built with React, TypeScript, and Tailwind CSS, it provides a modern and intuitive interface for stress monitoring and management.

## Features

### Core Features
- 👁️ Real-time eye image analysis
- 📊 Stress level detection with AI
- 📈 Historical stress data tracking
- 🎯 Personalized wellness recommendations
- 👤 User profile management with age tracking

### User Management
- 📝 User registration with age collection
- 🔐 Secure authentication system
- 👤 Age-aware user profiles
- 💾 Persistent user data storage

### Analysis Features
- 📸 Easy image upload (drag & drop supported)
- 🔍 Advanced eye pattern analysis
- 📊 Detailed stress probability metrics
- 📈 Historical trend analysis
- 🎯 Confidence level indicators

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python backend running on port 5174 (for API)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/eye-glaze-client-react-vite-main.git
cd eye-glaze-client-react-vite-main
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Working with User Data

### Accessing User Age from localStorage

The user's age is stored in localStorage along with other user data. Here's how to access it:

\`\`\`typescript
// Reading user data including age
const getUserData = () => {
  const storedUser = localStorage.getItem('eyeGlazeUser');
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    const userAge = userData.age; // Access the age property
    return userData;
  }
  return null;
};

// Example usage
const userData = getUserData();
if (userData?.age) {
  console.log(\`User's age: \${userData.age}\`);
}
\`\`\`

### User Data Structure in localStorage

The user data is stored in localStorage under the key 'eyeGlazeUser' with the following structure:

\`\`\`typescript
interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
}
\`\`\`

## Authentication Context

The application uses a React Context (AuthContext) for managing user authentication and data. The context provides:

- User data including age
- Login functionality
- Registration with age collection
- Logout functionality
- Loading state management

Example usage in components:

\`\`\`typescript
import { useAuth } from '@/contexts/AuthContext';

function YourComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      {user?.age && <p>Age: {user.age} years</p>}
    </div>
  );
}
\`\`\`

## Development

### Running the Full Stack

To run both the frontend and backend servers:

\`\`\`bash
npm run dev:full
\`\`\`

This will start:
- React frontend on default port (usually 5173)
- Python backend on port 5174
- Flask ML service on port 5000

### Environment Variables

No additional environment variables are required for the basic setup. The backend URLs are hardcoded to:
- Main API: http://localhost:5174
- ML Service: http://localhost:5000

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
