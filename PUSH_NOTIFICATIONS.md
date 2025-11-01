# Push Notifications Implementation

This document describes the push notification implementation for the Checkpoint external feedback web application.

## Overview

The application now supports Firebase Cloud Messaging (FCM) push notifications for browser-based notifications. This allows the backend to send scheduled and ad-hoc notifications to users who have granted notification permission.

## Architecture

### Frontend Components

1. **Firebase Configuration** ([src/services/firebase-config.ts](src/services/firebase-config.ts))
   - Initializes Firebase app with checkpoint-a9 project configuration
   - Exports VAPID key for web push authentication
   - Provides messaging instance getter

2. **Notification Service** ([src/services/notification-service.ts](src/services/notification-service.ts))
   - `requestNotificationPermission()` - Requests permission and gets FCM token
   - `registerToken(buildingID, token, guestID?)` - Registers token with backend API
   - `unregisterToken(buildingID, guestID, token)` - Unregisters token from backend
   - `deleteFCMToken()` - Deletes token from Firebase
   - `onForegroundMessage(callback)` - Handles notifications when app is active
   - `getNotificationPermission()` - Checks current permission status
   - `isNotificationSupported()` - Checks browser support

3. **Service Worker** ([public/firebase-messaging-sw.js](public/firebase-messaging-sw.js))
   - Handles background notifications when app is not in focus
   - Shows browser notifications for incoming messages
   - Handles notification clicks to open/focus the app

4. **Notification Permission Component** ([src/components/NotificationPermission.vue](src/components/NotificationPermission.vue))
   - Displays permission request UI card
   - Supports SK, EN, CS, DE languages
   - Auto-shows after 2 seconds if permission not yet requested
   - Can be dismissed (remembers user's choice)
   - Shows success/error feedback

5. **Store Updates** ([src/store.ts](src/store.ts))
   - Added `notificationToken` - Current FCM token
   - Added `guestID` - Backend guest identifier
   - Added `buildingID` - Building identifier for notifications
   - All notification state persisted to localStorage

### Backend Integration

The frontend integrates with the cloud functions API:

- **POST /addFCMToken** - Register device token
  - Query params: `buildingID` (required), `guestID` (optional)
  - Body: `{ token: string }`
  - Returns: `{ message: string, guestID: string }`

- **POST /removeFCMToken** - Unregister device token
  - Query params: `buildingID` (required), `guestID` (required)
  - Body: `{ token: string }`
  - Returns: `{ message: string }`

API endpoints are configured via environment variables:
- Development: `http://127.0.0.1:5001/checkpoint-a9/europe-west3`
- Production: `https://europe-west3-checkpoint-a9.cloudfunctions.net`

## User Flow

1. **User visits app with valid building/checkpoint** → `buildingID` is set in store
2. **After 2 seconds**, notification permission prompt appears (if not previously requested/dismissed)
3. **User clicks "Enable"**:
   - Browser requests notification permission
   - FCM token is obtained from Firebase
   - Token is registered with backend API
   - If no `guestID` exists, backend creates one automatically
   - `guestID` and token are stored in localStorage
4. **User receives notifications**:
   - **Foreground** (app active): Handled by `onForegroundMessage`, shows browser notification
   - **Background** (app inactive): Handled by service worker, shows system notification
5. **User clicks notification**: App opens/focuses

## Files Modified/Created

### New Files
- `src/services/firebase-config.ts` - Firebase initialization
- `src/services/notification-service.ts` - Notification API wrapper
- `src/components/NotificationPermission.vue` - UI component
- `public/firebase-messaging-sw.js` - Service worker
- `PUSH_NOTIFICATIONS.md` - This documentation

### Modified Files
- `package.json` - Added `firebase` dependency
- `src/store.ts` - Added notification state
- `src/main.ts` - Service worker registration
- `src/components/MainView.vue` - Integrated NotificationPermission component
- `src/components/ViewComponent.vue` - Set buildingID in store
- `vite.config.ts` - Service worker build configuration

## Configuration

### Firebase Configuration
The app uses the `checkpoint-a9` Firebase project:
- **Project ID**: checkpoint-a9
- **App ID**: 1:860517143126:web:0671e8e40a29ef469be1f7
- **VAPID Key**: BCQVBCtHPkNutu90rAWQBFk0E5Rej8PbgOJgnz7Cu9ZjhI5kkvg6wL9vDlQNIeKTBzPV2HRVW4AJjJEu7QpDxgk

### Environment Variables
No additional environment variables needed. API URL is already configured in `.env.development` and `.env.production`.

## Testing

### Local Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the app** with valid query parameters:
   ```
   http://localhost:4173/?buildingId=building123&checkpointId=checkpoint123&extFeedbackId=feedback123
   ```

3. **Grant notification permission** when prompted

4. **Check browser console** for:
   - Service worker registration
   - FCM token
   - Token registration with backend
   - Guest ID

5. **Test notifications** using the backend API or test client from cloud functions repo

### Production Testing

1. **Build and deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

2. **Open deployed app** with valid parameters

3. **Enable notifications** and verify token registration

4. **Send test notification** from backend

## Notification Types

According to the cloud functions implementation:

1. **Scheduled Notifications** - Recurring notifications (daily, weekly, monthly, custom intervals)
2. **Ad-hoc Notifications** - Immediate one-time notifications sent to all guests in a building
3. **Template-based Notifications** - Notifications created from reusable templates

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: iOS 16.4+, macOS 13+ (with limitations)
- **Opera**: Full support

Service worker and notifications must be served over HTTPS (except localhost).

## localStorage Keys

- `notificationToken` - Current FCM token
- `guestID` - Backend guest identifier
- `notificationRegistered` - Registration status flag
- `notification-prompt-dismissed` - User dismissed prompt flag
- `userLanguage` - Selected language (for notification texts)

## Security Considerations

1. **HTTPS Required** - Service workers only work over HTTPS (or localhost)
2. **VAPID Key** - Public key, safe to expose in client code
3. **Token Management** - Tokens are managed securely by Firebase
4. **Guest ID** - Generated by backend, no sensitive data exposed

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure app is served over HTTPS (or localhost)
- Clear service worker cache: DevTools → Application → Service Workers → Unregister

### No FCM Token
- Check notification permission status
- Verify Firebase configuration
- Check network requests for errors
- Ensure service worker is active

### Token Not Registering with Backend
- Verify API endpoint is correct
- Check network tab for 400/500 errors
- Ensure buildingID is set in query parameters
- Check backend logs

### Notifications Not Received
- Verify token is registered with backend
- Check browser notification settings
- Test with backend's test notification endpoint
- Check service worker is running

## Future Enhancements

Possible improvements:
- Notification preferences UI (enable/disable specific notification types)
- Notification history/inbox
- Rich notifications with actions
- Notification sound customization
- Multiple device management UI
- Notification statistics for users

## Related Documentation

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- Backend API: See `checkpoint_cloud_functions` repository README
