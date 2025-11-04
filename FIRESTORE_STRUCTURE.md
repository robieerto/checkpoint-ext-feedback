# Firestore Database Structure

## Overview

This document describes the Firestore database structure for the Checkpoint project based on analysis of the cloud functions code.

**Emulator Connection:**

- Firestore Emulator: `127.0.0.1:8080`
- Emulator UI: `http://127.0.0.1:4000/firestore`
- Hub: `127.0.0.1:4400`

## Collection Hierarchy

### Root Collections

#### `Buildings` (Root Collection)

The main collection containing all building/facility data.

**Document Structure:**

```typescript
{
  id: string
  guestTags?: string[]  // e.g., ["external"]
  // ... other building properties
}
```

##### Sub-collections under `Buildings/{buildingId}`:

###### 1. `checkpoints`

Checkpoint/location data within a building.

**Path:** `Buildings/{buildingId}/checkpoints/{checkpointId}`

**Document Structure:**

```typescript
{
  id: string
  // checkpoint configuration data
}
```

---

###### 2. `externalUserActions`

User actions submitted from external feedback system (orders, questions, reviews, occurrences).

**Path:** `Buildings/{buildingId}/externalUserActions/{actionId}`

**Document Types:**

- **Order** (`type: "order"`)
- **Question** (`type: "question"`)
- **Review** (`type: "review"`)
- **Occurrence** (external user occurrences)

**Common Fields:**

```typescript
{
  dateTime: Timestamp
  checkpoint: DocumentReference // Reference to checkpoints/{checkpointId}
  template: DocumentReference // Reference to the action template
  type: 'order' | 'question' | 'review'
  state: 'todo' | string
}
```

**Order Document:**

```typescript
{
  ...commonFields,
  type: "order"
  inputs: string[]           // User selections
  selectedOption?: number | null
  selectedNumber?: number | null
  note?: string
  phone?: string            // Only added if valid
  email?: string            // Only added if valid
  guest?: DocumentReference // Reference to guests/{guestId} if saveUser option enabled
}
```

**Question Document:**

```typescript
{
  ...commonFields,
  type: "question"
  text: string             // Question text (max 1000 chars based on note validation)
  phone?: string           // Only added if valid
  email?: string           // Only added if valid
}
```

**Review Document:**

```typescript
{
  ...commonFields,
  type: "review"
  score: number
  note: string
  email: string
  questionnaire?: Array<{
    question: string
    answers: Array<{
      choice: string
      input?: string
    }>
    otherInput?: string
  }>
}
```

---

###### 3. `guests`

Guest/customer data for notifications and tracking.

**Path:** `Buildings/{buildingId}/guests/{guestId}`

**Document Structure:**

```typescript
{
  id: string
  fcmTokens?: string[]         // Firebase Cloud Messaging tokens for push notifications
  isExternal?: boolean         // true for external feedback users
  tags?: string[]              // e.g., ["external"]
  email?: string
  phone?: string
  name?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}
```

**Key Features:**

- Guests can be created/updated when external users submit actions (if `saveUser` option is enabled)
- Lookup by email or phone to avoid duplicates
- FCM tokens stored as array for multi-device support

---

###### 4. `notifications`

Scheduled push notification configurations for guests.

**Path:** `Buildings/{buildingId}/notifications/{notificationId}`

**Document Structure:**

```typescript
{
  id: string
  buildingID: string
  name: string                    // Max 100 chars
  description: string             // Max 500 chars
  title: string                   // Max 200 chars - notification title
  message: string                 // Max 1000 chars - notification body
  time: string                    // Format: "HH:MM" (24-hour)

  // Scheduling
  startDate: Timestamp
  nextScheduledAt?: Timestamp | null
  lastSentAt?: Timestamp

  // Recurrence configuration
  recurrence: {
    type: "once" | "daily" | "weekly" | "monthly" | "custom"

    // For type: "custom"
    interval?: number             // e.g., 2
    unit?: "hours" | "days" | "weeks" | "months"  // default: "days"

    // For type: "weekly"
    daysOfWeek?: DayOfWeek[]     // e.g., ["monday", "wednesday", "friday"]

    // For type: "monthly"
    dayOfMonth?: number           // 1-31

    // Ending rules
    endDate?: Timestamp | null
    endAfterOccurrences?: number | null
  }

  // Status and tracking
  enabled: boolean
  occurrenceCount: number
  totalSuccessfulDeliveries: number
  totalFailedDeliveries: number

  // Delivery statistics (last send)
  lastDeliveryStats?: {
    successCount: number
    failureCount: number
    invalidTokenCount: number
    errors: string[]
  }

  createdAt: Timestamp
}
```

**Recurrence Types:**

- `once` - Send once at startDate + time
- `daily` - Send every day at specified time
- `weekly` - Send on specific days of week
- `monthly` - Send on specific day of month
- `custom` - Send at custom intervals (e.g., every 2 hours, every 3 days)

**Key Features:**

- Notifications can be created from templates
- Automatic scheduling and recurrence calculation
- Tracks delivery success/failure rates
- Auto-disables after reaching occurrence limit or end date
- Invalid FCM tokens are automatically cleaned up

---

###### 5. `notificationTemplates`

Reusable notification templates.

**Path:** `Buildings/{buildingId}/notificationTemplates/{templateId}`

**Document Structure:**

```typescript
{
  id: string
  name: string // Max 100 chars
  description: string // Max 500 chars
  title: string // Max 200 chars
  message: string // Max 1000 chars
  time: string // Format: "HH:MM"
  recurrence: {
    // Same structure as notifications
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
    // ... other recurrence fields
  }
}
```

**Key Features:**

- Templates can be used to quickly create notifications
- When creating a notification from a template, all fields are copied
- Templates are independent of notification instances

---

## Action Templates

External action templates are stored at custom paths (referenced by `extActionPath` in API calls).

**Common Template Fields:**

```typescript
{
  // Reservation configuration (for orders)
  reservation?: {
    capacity?: number         // Total capacity
    freeCapacity?: number     // Available capacity
    dateReserved?: string     // "DD.MM.YYYY" format
    type?: "today" | "tomorrow"

    // OR exclusive time-based reservations
    exclusive?: boolean
    times?: Array<{
      start: string          // e.g., "09:00"
      end: string            // e.g., "10:00"
      dateReserved?: string
    }>
  }

  // Options
  options?: {
    saveUser?: boolean       // Whether to save guest data
  }
}
```

---

## API Endpoints & Database Operations

### External User Actions

1. **Create Order** - `POST /api/createExtUserOrder`

   - Creates document in `Buildings/{buildingId}/externalUserActions`
   - Handles reservation capacity/time management
   - Optionally creates/updates guest in `guests` collection

2. **Create Question** - `POST /api/createExtUserQuestion`

   - Creates document in `Buildings/{buildingId}/externalUserActions`
   - Requires valid email OR phone

3. **Create Review** - `POST /api/createExtUserReview`

   - Creates document in `Buildings/{buildingId}/externalUserActions`
   - Includes optional questionnaire data

4. **Create Occurrence** - `POST /api/createOccurrenceExt`

   - Creates external user occurrence in `externalUserActions`

5. **Get Action Data** - `POST /api/extFeedbackActionData`
   - Retrieves external action template data

### Guest Notifications

1. **FCM Token Management**

   - `POST /api/addFCMToken` - Adds token to guest's `fcmTokens` array
   - `POST /api/removeFCMToken` - Removes token from array

2. **Notification CRUD**

   - `POST /api/createNotification` - Creates in `notifications` collection
   - `PUT /api/updateNotification` - Updates notification
   - `GET /api/getNotifications` - Lists notifications with filters
   - `DELETE /api/deleteNotification` - Deletes notification
   - `POST /api/sendNotification` - Sends notification immediately

3. **Template CRUD**

   - `POST /api/createTemplate` - Creates in `notificationTemplates` collection
   - `PUT /api/updateTemplate` - Updates template
   - `GET /api/getTemplates` - Lists templates
   - `DELETE /api/deleteTemplate` - Deletes template

4. **Processing**
   - `POST /api/processNotifications` - Scheduled job to send due notifications

---

## Database Queries

### Common Query Patterns

**Find guest by email:**

```typescript
Buildings / { buildingId } / guests.where('email', '==', email).limit(1)
```

**Find guest by phone:**

```typescript
Buildings / { buildingId } / guests.where('phone', '==', phone).limit(1)
```

**Get enabled notifications:**

```typescript
Buildings / { buildingId } / notifications.where('enabled', '==', true)
```

**Get due notifications:**

```typescript
Buildings /
  { buildingId } /
  notifications.where('enabled', '==', true).where('nextScheduledAt', '<=', now)
```

**Get active notifications:**

```typescript
Buildings / { buildingId } / notifications.where('nextScheduledAt', '!=', null)
```

**Get all guests with FCM tokens:**

```typescript
Buildings / { buildingId } / guests
// Filter in application code for guests with fcmTokens.length > 0
```

---

## Data Validation

### Phone Numbers

- Validated using `phone` library
- Format: International format preferred
- `validateMobilePrefix: false`

### Emails

- Validated using regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Field Length Limits

- Name: 1-100 characters
- Description: 1-500 characters
- Title: 1-200 characters
- Message: 1-1000 characters
- Note: up to 1000 characters
- Time format: `HH:MM` (24-hour, regex: `/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/`)

---

## Notes

1. **Batch Operations**: The codebase uses batch operations for atomic updates, especially when:

   - Updating notification after sending
   - Removing invalid FCM tokens

2. **References**: The database uses Firestore DocumentReferences to link:

   - Actions → Checkpoints
   - Actions → Action Templates
   - Actions → Guests

3. **Date Handling**:

   - Dates stored as Firestore Timestamps
   - Reservation dates stored as strings in "DD.MM.YYYY" format (Slovak locale)
   - Time stored as "HH:MM" strings

4. **Auto-generated IDs**: All collections use Firestore auto-generated document IDs

5. **Converters**: The codebase uses Firestore data converters for type safety:
   - `guestConverter` for guests
   - `guestNotificationConverter` for notifications
