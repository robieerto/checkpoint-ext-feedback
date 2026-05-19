# Firestore Emulator - Actual Data Summary

**Emulator:** `127.0.0.1:8080`
**UI:** `http://127.0.0.1:4000/firestore`
**Scan Date:** 2025-11-04

---

## Database Overview

The Firestore emulator contains **17 Buildings** with extensive real-world data.

---

## Root Collection: `Buildings`

### Buildings List

| Building ID | Name | Documents in Subcollections |
|------------|------|---------------------------|
| `demo` | Demo | 4 checkpoints |
| `demoBuilding` | Demo Budova | 3 checkpoints, 27 externalUserActions, 11 guests |
| `fffreakHouse` | FFFreak House | 4 checkpoints |
| `forumPP` | Forum Poprad | 5 checkpoints |
| `hotel-yasmin` | Hotel Yasmin | 178 checkpoints (full hotel) |
| `kapkaResort` | Kapka Resort | 50 checkpoints, 33 externalUserActions |
| `maxPP` | Max Poprad | 3 checkpoints, 4 tasks |
| `penzionFortuna` | Penzión Fortuna | 10 checkpoints, 17 externalUserActions |
| `penzionPalusak` | Penzión Palušák | 15 checkpoints, 3 externalUserActions |
| `penzionSport` | Penzión Šport | 12 checkpoints |
| `smrek` | Smrek | 1 checkpoint |
| `testA1` | Test A1 | 3 checkpoints, 148 externalUserActions, 14 guests, 5 notifications |
| `testB1` | Test B1 | 3 checkpoints, 137 externalUserActions, 39 guests, 3 notifications |
| ... and 4 more buildings | | |

---

## Key Data Structures (Real Examples)

### 1. Building Document

**Example:** `Buildings/demoBuilding`

```json
{
  "name": "Demo Budova",
  "guestTags": ["external", "kontaktovaný", "VIP"],
  "configuration": {
    "hasExclusiveReservations": false,
    "hasGuestDatabase": true,
    "isEmailAllowed": true
  }
}
```

**Example:** `Buildings/penzionFortuna`

```json
{
  "name": "Penzión Fortuna",
  "language": "sk",
  "availableLanguages": ["sk"],
  "googleUrl": "https://www.google.com/maps/place/Pension+Fortuna/...",
  "configuration": {
    "hasExclusiveReservations": true,
    "isEmailAllowed": true
  }
}
```

---

### 2. Checkpoints (`Buildings/{id}/checkpoints`)

**Example - Hotel Room:**

```json
{
  "id": "M5kw1AoQBVC6aEfHwEWn",
  "name": "Izba 11",
  "state": "task",
  "isRoom": true,
  "floor": "[Reference: Buildings/demoBuilding/floors/6y0bMgnawiuLxaoKmNNJ]",
  "states": {
    "cleaning": "todo",
    "pr": "done",
    "maintenance": "done"
  }
}
```

**Example - Public Space:**

```json
{
  "id": "lHN8uG6BOvUf0LzL704p",
  "name": "Toalety",
  "description": "",
  "state": "ok",
  "floor": "[Reference: Buildings/demo/floors/WwkFxS1JNUfSA6IxlH49]",
  "states": {
    "cleaning": "done"
  }
}
```

**State Values Found:**
- `state`: `"ok"`, `"task"`, `"error"`, `"toCheck"`
- Individual service states: `"done"`, `"todo"`, `"toCheck"`

---

### 3. External User Actions (`Buildings/{id}/externalUserActions`)

#### Type: `review` (Customer Reviews)

**Example 1:**
```json
{
  "dateTime": "2025-10-23T17:24:48.384Z",
  "checkpoint": "[Reference: Buildings/demoBuilding/checkpoints/M5kw1AoQBVC6aEfHwEWn]",
  "template": "[Reference: Buildings/demoBuilding/externalFeedbackActions/review]",
  "type": "review",
  "score": 5,
  "note": "páči sa mi tu, je tu vírivka a tiež les",
  "state": "todo",
  "email": ""
}
```

**Example 2 (with questionnaire):**
```json
{
  "dateTime": "2025-06-01T19:29:24.976Z",
  "checkpoint": "[Reference]",
  "template": "[Reference]",
  "type": "review",
  "score": 5,
  "note": "Super, všetko nám vyhovovalo",
  "state": "todo",
  "email": "test@test.sk",
  "questionnaire": [
    {
      "question": "Ste spokojný s čistotou?",
      "answers": [
        {
          "choice": "Veľmi spokojný",
          "input": ""
        }
      ],
      "otherInput": ""
    }
  ]
}
```

#### Type: `order` (Service Orders)

**Example - Breakfast Order:**
```json
{
  "dateTime": "2025-09-12T07:31:35.417Z",
  "checkpoint": "[Reference: Buildings/demoBuilding/checkpoints/M5kw1AoQBVC6aEfHwEWn]",
  "template": "[Reference: Buildings/demoBuilding/externalFeedbackActions/breakfast]",
  "type": "order",
  "note": "",
  "phone": "+421948448884",
  "email": "juhas@gmail.com",
  "inputs": ["3"],
  "state": "todo"
}
```

**Example - E-bikes Rental:**
```json
{
  "dateTime": "2025-09-26T13:50:47.969Z",
  "checkpoint": "[Reference]",
  "template": "[Reference: Buildings/demoBuilding/externalFeedbackActions/ebikes]",
  "type": "order",
  "note": "",
  "phone": "0911250419",
  "inputs": ["1"],
  "state": "todo"
}
```

**Example - Loyalty Program (with guest reference):**
```json
{
  "dateTime": "2025-09-12T13:31:48.721Z",
  "checkpoint": "[Reference]",
  "template": "[Reference: Buildings/demoBuilding/externalFeedbackActions/loyalty]",
  "type": "order",
  "note": "Marek Matusek",
  "phone": "+421999999999",
  "email": "matusek@gmail.com",
  "inputs": [],
  "guest": "[Reference: Buildings/demoBuilding/guests/yw9rL8ATfPEeq5imujfq]",
  "state": "todo"
}
```

**Example - Exclusive Reservation (Sauna):**
```json
{
  "dateTime": "2024-12-17T15:14:59.987Z",
  "checkpoint": "[Reference: Buildings/penzionFortuna/checkpoints/jl5PMtRd0p9mHbeymkAi]",
  "template": "[Reference: Buildings/penzionFortuna/externalFeedbackActions/sauna]",
  "type": "order",
  "inputs": ["18:30 - 20:30"],
  "state": "todo"
}
```

**Example - Tennis Court with Equipment:**
```json
{
  "dateTime": "2024-12-17T15:15:04.781Z",
  "checkpoint": "[Reference]",
  "template": "[Reference: Buildings/penzionFortuna/externalFeedbackActions/tenis]",
  "type": "order",
  "inputs": [
    "17:00 - 19:00",
    "+ Tenisový set (2 rakety, 6 loptičiek)"
  ],
  "state": "todo"
}
```

#### Type: `question` (Customer Questions)

**Example:**
```json
{
  "dateTime": "2025-02-01T13:50:26.858Z",
  "checkpoint": "[Reference: Buildings/penzionFortuna/checkpoints/vPPoC9M1SNXf05ziPOai]",
  "template": "[Reference: Buildings/penzionFortuna/externalFeedbackActions/question]",
  "type": "question",
  "text": "I would like to ask for the wifi password",
  "phone": "+48600923364",
  "state": "todo"
}
```

#### Type: `occurrence` (Issue Reports)

**Example:**
```json
{
  "dateTime": "2025-01-26T09:50:34.293Z",
  "checkpoint": "[Reference: Buildings/kapkaResort/checkpoints/WkFwZA7iTpoWTWkmClJS]",
  "template": "[Reference: ext-feedback-action/faQcbA12DNTzv66gvO5X]",
  "type": "occurrence",
  "occurrence": "[Reference: Buildings/kapkaResort/checkpoints/.../occurrences/nnf89qYH4kMDaWih316i]",
  "state": "todo"
}
```

**State Values:** `"todo"`, `"reserved"`, `"done"`, `"InProgress"`

---

### 4. Guests (`Buildings/{id}/guests`)

**Example 1 - Basic Guest:**
```json
{
  "createdAt": "2025-08-22T08:31:25.863Z",
  "name": "Ján Hollý",
  "phone": "+421123456789"
}
```

**Example 2 - VIP Guest:**
```json
{
  "createdAt": "2025-08-27T16:49:13.782Z",
  "updatedAt": "2025-09-12T14:11:46.518Z",
  "updatedBy": "[Reference: Users/robieerto]",
  "name": "Alex Veľký",
  "phone": "+4215544668877",
  "email": "alexv@gmail.com",
  "tags": ["VIP"],
  "discountType": "",
  "note": ""
}
```

**Example 3 - External Guest with FCM Token:**
```json
{
  "id": "F73kpT6zCSaR1UFd333Z",
  "createdAt": "2025-10-28T14:45:07.511Z",
  "isExternal": true,
  "fcmTokens": [
    "dTat1dsJAT0JMe69aK_RC0:APA91bH4-2Go759Agu7c-MSoSlmdzm46hItf00KLL9OzKkUtZaBZYvQke6ePw-GPEIcIDyn8N0..."
  ]
}
```

**Example 4 - External Guest with Full Contact:**
```json
{
  "createdAt": "2025-09-11T07:41:05.839Z",
  "updatedAt": "2025-09-12T16:53:33.013Z",
  "updatedBy": "[Reference: Users/robieerto]",
  "isExternal": true,
  "name": "Tomáš Čekovský",
  "phone": "+421987654321",
  "email": "tomascek@gmail.com",
  "tags": ["external", "VIP"],
  "discountType": "",
  "note": ""
}
```

---

### 5. Notifications (`Buildings/{id}/notifications`)

**Example 1 - One-time Notification:**
```json
{
  "id": "5G5GiYxUE1wJ61Nej4XU",
  "buildingID": "testB1",
  "name": "Test notification (once)",
  "description": "Test description once",
  "title": "Test once",
  "message": "Test message once",
  "time": "14:00",
  "startDate": "2025-10-27T22:00:00.000Z",
  "recurrence": {
    "type": "once"
  },
  "enabled": false,
  "createdAt": "2025-10-28T12:27:45.819Z",
  "lastDeliveryStats": {
    "successCount": 1,
    "failureCount": 0,
    "invalidTokenCount": 0,
    "errors": []
  },
  "lastSentAt": "2025-10-28T12:28:00.082Z",
  "nextScheduledAt": null,
  "occurrenceCount": 1,
  "totalFailedDeliveries": 0,
  "totalSuccessfulDeliveries": 1
}
```

**Example 2 - Daily Recurring Notification:**
```json
{
  "id": "CtRO3qLl62p3pSt1qPrD",
  "buildingID": "testB1",
  "name": "Test notification (daily)",
  "description": "Test description daily",
  "title": "Test daily",
  "message": "Test message daily",
  "time": "14:00",
  "startDate": "2025-10-27T22:00:00.000Z",
  "recurrence": {
    "type": "daily"
  },
  "enabled": false,
  "createdAt": "2025-10-28T12:27:40.699Z",
  "lastDeliveryStats": {
    "successCount": 1,
    "failureCount": 0,
    "invalidTokenCount": 0,
    "errors": []
  },
  "lastSentAt": "2025-10-28T12:28:00.075Z",
  "nextScheduledAt": "2025-10-28T14:00:00.000Z",
  "occurrenceCount": 1,
  "totalFailedDeliveries": 0,
  "totalSuccessfulDeliveries": 1
}
```

**Example 3 - Weekly Notification (with end condition):**
```json
{
  "id": "LmrY3xEQrKlZ5F4sI6QS",
  "buildingID": "testA1",
  "name": "Test notification (weekly)",
  "description": "Test description weekly",
  "title": "Test weekly",
  "message": "Test message weekly",
  "time": "10:00",
  "startDate": "2025-10-24T22:00:00.000Z",
  "recurrence": {
    "type": "weekly",
    "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "endAfterOccurrences": 3
  },
  "enabled": false,
  "createdAt": "2025-10-25T08:41:45.055Z",
  "lastDeliveryStats": {
    "successCount": 1,
    "failureCount": 0,
    "invalidTokenCount": 0,
    "errors": []
  },
  "lastSentAt": "2025-10-29T08:42:00.117Z",
  "nextScheduledAt": null,
  "occurrenceCount": 3,
  "totalFailedDeliveries": 0,
  "totalSuccessfulDeliveries": 3
}
```

**Example 4 - Monthly Notification:**
```json
{
  "id": "lx9YL6xyh7Hn7EW38nF0",
  "buildingID": "testA1",
  "name": "Test notification (monthly)",
  "description": "Test description monthly",
  "title": "Test monthly",
  "message": "Test message monthly",
  "time": "10:00",
  "startDate": "2025-10-24T22:00:00.000Z",
  "recurrence": {
    "type": "monthly",
    "dayOfMonth": 25
  },
  "enabled": true,
  "createdAt": "2025-10-25T08:41:51.126Z",
  "nextScheduledAt": "2025-11-25T09:00:00.000Z",
  "occurrenceCount": 0,
  "totalFailedDeliveries": 0,
  "totalSuccessfulDeliveries": 0
}
```

**Example 5 - Custom Interval (Every 2 Days):**
```json
{
  "id": "wHqpFZaCKfLlKCWvQX2H",
  "buildingID": "testA1",
  "name": "Test notification (every 2 days)",
  "description": "Test description custom",
  "title": "Test custom",
  "message": "Test message custom",
  "time": "10:00",
  "startDate": "2025-10-24T22:00:00.000Z",
  "recurrence": {
    "type": "custom",
    "interval": 2,
    "unit": "days"
  },
  "enabled": true,
  "createdAt": "2025-10-25T08:41:56.326Z",
  "nextScheduledAt": "2025-11-06T09:00:00.000Z",
  "occurrenceCount": 0,
  "totalFailedDeliveries": 0,
  "totalSuccessfulDeliveries": 0
}
```

---

### 6. Tasks (`Buildings/{id}/tasks`)

**Example - Maintenance Task:**
```json
{
  "dateTime": "2023-02-26T17:02:57.033Z",
  "service": "[Reference: Services/sbs1]",
  "name": "Nefunkčný záchod",
  "description": "popis aaa",
  "checkpoints": [
    {
      "checkpoint": "[Reference: Buildings/maxPP/checkpoints/ItHVz076KhDf41QJN1iF]",
      "done": true
    },
    {
      "checkpoint": "[Reference: Buildings/maxPP/checkpoints/mv2dzaFiMfyZMXYBosyz]",
      "done": true
    }
  ],
  "state": "InProgress",
  "priority": "High",
  "userID": "johnSbs"
}
```

**Task States:** `"New"`, `"InProgress"`, `"Done"`
**Priorities:** `"High"`, `"Medium"`, `"Low"`

---

## Statistics

### Buildings with Most Activity

1. **testB1** - 137 external user actions, 39 guests, 3 notifications
2. **testA1** - 148 external user actions, 14 guests, 5 notifications
3. **hotel-yasmin** - 178 checkpoints (full hotel structure)
4. **kapkaResort** - 50 checkpoints, 33 external user actions
5. **demoBuilding** - 27 external user actions, 11 guests

### Action Types Distribution

Based on sample data from `demoBuilding` (27 actions):
- **Reviews:** Multiple reviews with scores 1-5
- **Orders:** Breakfast, E-bikes, Loyalty program, Bar service
- **Questions:** Customer inquiries
- **Occurrences:** Issue reports

### Guest Data Insights

- Total guests across sampled buildings: **64+ guests**
- External guests (from feedback): ~30%
- Guests with FCM tokens: Multiple (for push notifications)
- Tagged guests: VIP, external, kontaktovaný (contacted)

### Notification Insights

- **Active notifications:** 8 found across testA1 and testB1
- **Recurrence types used:** once, daily, weekly, monthly, custom
- **Most common time:** 10:00 and 14:00
- **Delivery success rate:** Very high (most show 100% success)
- **Auto-disable:** Notifications automatically disable after completion

---

## Common Patterns

### Phone Number Formats
- International format: `+421987654321`
- With spaces: `+421 903 123 123`
- Czech: `+420602573328`
- Polish: `+48600923364`

### Languages
- **Slovak (sk):** Primary language for most buildings
- **Czech (cz):** Kapka Resort, Forum Poprad
- **English (en):** Demo building

### Service Categories
From checkpoint states:
- `cleaning` - Housekeeping
- `maintenance` - Repairs/maintenance
- `pr` - Public relations/front desk
- `sbs` - Possibly security/building services

### External Feedback Actions
Common templates found:
- `review` - Customer feedback
- `breakfast` - Breakfast orders
- `ebikes` - E-bike rentals
- `sauna` - Sauna reservations
- `tenis` - Tennis court bookings
- `bar` - Bar service
- `loyalty` - Loyalty program signups
- `question` - General inquiries
- `aquapark` - Aquapark tickets

---

## Next Steps for Testing

1. **Create test data:**
   - Add a new guest with FCM token
   - Create external user actions (order, question, review)
   - Set up notifications

2. **Test workflows:**
   - Submit feedback from the frontend
   - Test reservation systems
   - Send push notifications

3. **Query patterns to test:**
   - Get all guests with FCM tokens
   - Get due notifications
   - Filter external user actions by date/type
   - Get checkpoint state changes

4. **Integration tests:**
   - FCM token management
   - Notification scheduling
   - Guest deduplication
   - Invalid token cleanup

---

## Related Documentation

- **[LANGUAGE_STRUCTURE_ANALYSIS.md](LANGUAGE_STRUCTURE_ANALYSIS.md)** - Complete analysis of external feedback action language structure with TypeScript types (includes implementation details)
- **[FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md)** - Complete Firestore database schema reference
- **[src/types.ts](src/types.ts)** - TypeScript interface definitions (updated to match Firestore structure)
