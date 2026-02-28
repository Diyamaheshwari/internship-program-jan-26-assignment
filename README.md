# Character-Based Short Video Series Generator

A comprehensive platform for creating character-based short video series with consistent characters across episodes. Each episode is approximately 5 minutes long and maintains character consistency in appearance, personality, and relationships.

## Features

### 🎭 Series Management
- Create and manage multiple video series
- Define series bible with genre, tone, and world settings
- Set target duration, language, and aspect ratio
- Organize episodes within each series

### 👥 Character System
- Create detailed character profiles with:
  - Visual characteristics (age, gender, appearance)
  - Personality traits and speaking styles
  - Voice characteristics for audio generation
  - Reference images for visual consistency
- Define relationships between characters
- Character consistency rules across episodes

### 📝 Episode Creation
- Story prompt-based episode creation
- Character selection and role assignment
- Genre and tone configuration
- Duration and format settings

### 🎬 Content Generation
- **Script Generation**: AI-powered script generation with character personality integration
- **Storyboard**: Automatic shot list and scene planning
- **Visual Assets**: Character and background prompts for AI generation
- **Audio Planning**: Voice lines, narration, and music cues

### 🎥 Production Pipeline
- Progress tracking for each production stage
- Asset management and organization
- Export-ready production packages

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Sharp** for image processing
- **OpenAI API** integration (optional)

### Frontend
- **React 18** with hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for form management
- **Axios** for API calls
- **React Hot Toast** for notifications

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd character-video-series-generator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/character-video-series
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   
   # AI Integration (Optional)
   OPENAI_API_KEY=your-openai-api-key-here
   
   # File Upload Settings
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   
   # Video Rendering Settings
   MAX_EPISODE_DURATION=300
   DEFAULT_VIDEO_FORMAT=mp4
   DEFAULT_ASPECT_RATIO=16:9
   ```

4. **Start MongoDB**
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas for cloud instance
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately:
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Series Management
- `GET /api/series` - Get all user series
- `POST /api/series` - Create new series
- `GET /api/series/:id` - Get series details
- `PUT /api/series/:id` - Update series
- `DELETE /api/series/:id` - Delete series

### Character Management
- `GET /api/characters/series/:seriesId` - Get series characters
- `POST /api/characters` - Create character
- `GET /api/characters/:id` - Get character details
- `PUT /api/characters/:id` - Update character
- `POST /api/characters/:id/relationships` - Add relationship
- `DELETE /api/characters/:id` - Delete character

### Episode Management
- `GET /api/episodes/series/:seriesId` - Get series episodes
- `POST /api/episodes` - Create episode
- `GET /api/episodes/:id` - Get episode details
- `PUT /api/episodes/:id` - Update episode
- `DELETE /api/episodes/:id` - Delete episode

### Script Generation
- `POST /api/scripts/generate/:episodeId` - Generate script
- `GET /api/scripts/:episodeId` - Get episode script
- `PUT /api/scripts/:episodeId` - Update script

### Asset Management
- `POST /api/assets/characters/:characterId/reference` - Upload reference image
- `POST /api/assets/episodes/:episodeId/generate` - Generate visual assets
- `POST /api/assets/episodes/:episodeId/storyboard` - Generate storyboard
- `GET /api/assets/episodes/:episodeId` - Get episode assets

## Database Schema

### User
- Authentication and profile information
- Usage statistics and preferences
- Subscription management

### Series
- Series metadata and settings
- Character and episode relationships
- World-building information

### Character
- Detailed character profiles
- Visual and personality traits
- Relationship mappings
- Voice characteristics

### Episode
- Episode metadata and configuration
- Generated content (script, storyboard, assets)
- Progress tracking
- Production pipeline status

## Usage Workflow

1. **Create a Series**
   - Define series title, description, genre, and tone
   - Set world details and visual style
   - Configure technical settings

2. **Add Characters**
   - Create character profiles with detailed traits
   - Upload reference images for visual consistency
   - Define relationships between characters

3. **Create Episodes**
   - Provide story prompts (situation, conflict, resolution)
   - Select participating characters
   - Configure episode settings

4. **Generate Content**
   - Auto-generate scripts with character personality integration
   - Create storyboards and shot lists
   - Generate visual asset prompts
   - Plan audio elements

5. **Production**
   - Track progress through production stages
   - Export production packages
   - Generate final video output

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## Future Enhancements

- [ ] AI-powered video rendering
- [ ] Advanced character animation
- [ ] Multi-language support
- [ ] Collaboration features
- [ ] Template library
- [ ] Advanced analytics
- [ ] Integration with video editing software
- [ ] Mobile app support
