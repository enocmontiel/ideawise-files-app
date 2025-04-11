# Media File Upload System

A cross-platform media file upload solution built with Expo (React Native) that supports both web and mobile platforms.


### Quick Demo
https://github.com/user-attachments/assets/6622c9de-ba06-4730-86ad-8a0859d64234

### Multiple Files
https://github.com/user-attachments/assets/67835487-81cd-4c8d-958d-9f2223d99492



## Features

-   Multiple file selection (1-10 files)
-   File type filtering (images and videos)
-   Instant file validation
-   Visual file preview with thumbnails
-   Platform-specific optimizations:
    -   Web: Drag and drop support, blob-based chunk handling
    -   Mobile: Camera upload, base64 chunk encoding, optimized chunk sizes
-   Chunked upload system:
    -   Web: 1MB chunks with blob handling
    -   Mobile: Optimized chunk sizes with base64 encoding
-   Device-specific upload tracking
-   Concurrent uploads (max 3 parallel)
-   Upload progress tracking
-   Pause/resume/cancel operations
-   Automatic retry mechanism
-   Background upload support
-   Upload history with local storage
-   Cross-platform compatibility
-   Responsive design for web platforms

## Tech Stack

Core:

-   Expo (React Native) - Cross-platform development framework
-   TypeScript - Type-safe development
-   React Native Web - Web platform support

State Management & Storage:

-   Zustand - Lightweight state management
-   AsyncStorage - Persistent local storage
-   Expo FileSystem - File handling and management

UI & Interaction:

-   React Native Reanimated - Advanced animations
-   React Native Gesture Handler - Touch and gesture handling
-   Expo Image - Optimized image rendering
-   Expo Blur - UI blur effects
-   Expo Haptics - Haptic feedback
-   @expo/vector-icons - Icon library

Media Handling:

-   Expo Document Picker - File selection
-   Expo Image Picker - Image/video selection
-   Expo Camera - Direct camera access
-   Expo Media Library - Media file access
-   Expo AV - Audio/video playback

Networking & Data:

-   Axios - HTTP client
-   date-fns - Date manipulation
-   UUID - Unique identifier generation
-   Expo Crypto - Cryptographic operations

Background Tasks:

-   Expo Background Fetch - Background operations
-   Expo Task Manager - Task scheduling

Navigation:

-   Expo Router - File-based routing
-   React Navigation - Navigation management

Development & Testing:

-   Jest - Testing framework
-   TypeScript - Static type checking
-   Expo Dev Client - Development tools

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

-   `POST /api/upload/initiate`

    -   Initiates file upload
    -   Request: `{ fileName, fileSize, mimeType, deviceId }`
    -   Response: `{ fileId, uploadUrl, chunks, chunkSize }`

-   `POST /api/upload/chunk`

    -   Uploads file chunk
    -   Form data: `{ fileId, chunkIndex, totalChunks, chunk, deviceId }`
    -   Platform-specific:
        -   Web: Sends chunks as blobs
        -   Mobile: Sends chunks as base64 encoded strings

-   `POST /api/upload/finalize`

    -   Finalizes upload
    -   Request: `{ fileId, fileName, deviceId }`
    -   Response: `{ success: true, file: FileMetadata }`

-   `GET /api/upload/status/:fileId`

    -   Gets upload status
    -   Query params: `deviceId` (required)
    -   Response: `{ fileId, progress, status, error? }`

-   `POST /api/upload/cancel`

    -   Cancels upload
    -   Request: `{ fileId, deviceId }`
    -   Response: `{ success: true }`

-   `GET /api/files`

    -   Lists uploaded files
    -   Query params: `deviceId` (required)
    -   Response: `FileMetadata[]`

-   `DELETE /api/files/:id`

    -   Deletes file
    -   Query params: `deviceId` (required)
    -   Response: `{ success: true }`

-   `GET /api/files/:id`
    -   Gets file details
    -   Query params: `deviceId` (required)
    -   Response: `FileMetadata`

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
