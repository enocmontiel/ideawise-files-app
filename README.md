# Media File Upload System

A cross-platform media file upload solution built with Expo (React Native) that supports both web and mobile platforms.

## Features

-   Multiple file selection (1-10 files)
-   File type filtering (images and videos)
-   Instant file validation
-   Visual file preview with thumbnails
-   Chunked upload (1MB chunks)
-   Concurrent uploads (max 3 parallel)
-   Upload progress tracking
-   Pause/resume/cancel operations
-   Automatic retry mechanism
-   Background upload support
-   Drag and drop support (web)
-   Camera upload (mobile)
-   Upload history with local storage

## Tech Stack

-   Expo (React Native)
-   TypeScript
-   Zustand (State Management)
-   AsyncStorage (Local Storage)
-   Axios (API Client)
-   React Native Reanimated (Animations)
-   Expo Document Picker
-   Expo Image Picker
-   Expo File System
-   Expo Background Fetch

## Getting Started

1. Install dependencies:

    ```bash
    npm install
    ```

2. Start the development server:

    ```bash
    npm start
    ```

3. Run on your preferred platform:

    ```bash
    # Web
    npm run web

    # iOS
    npm run ios

    # Android
    npm run android
    ```

## Project Structure

```
├── app/                    # App screens and navigation
├── components/             # Reusable components
├── hooks/                  # Custom hooks
├── services/              # API services
├── store/                 # Zustand store
├── tasks/                 # Background tasks
└── types/                 # TypeScript types
```

## API Endpoints

The app expects the following API endpoints:

-   `POST /api/upload/initiate` - Initiate file upload
-   `POST /api/upload/chunk` - Upload file chunk
-   `POST /api/upload/finalize` - Finalize upload
-   `GET /api/upload/status/:fileId` - Get upload status
-   `POST /api/upload/cancel` - Cancel upload
-   `GET /api/files` - List uploaded files
-   `DELETE /api/files/:id` - Delete file
-   `GET /api/files/:id` - Get file details

## Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
