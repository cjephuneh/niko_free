# Admin Event Promotion Feature

## Overview
Added a comprehensive event promotion management system for admins, allowing them to view all promoted events and promote events directly from the admin dashboard.

## Features Implemented

### 1. **Promoted Events Tab in Admin Dashboard**
- Two-tab navigation system: "All Events" and "Promoted Events"
- Clean tab interface with icons (Sparkles icon for promoted events)
- Responsive design with dark mode support

### 2. **Promoted Events Display**
The promoted events tab shows a comprehensive table with the following information:

#### Event Details
- Event title and partner name
- Start and end dates of promotion
- Duration in days

#### Financial Information
- Total revenue from promotion (KES)
- Cost per day breakdown
- Revenue tracking per event

#### Performance Metrics (Reach)
- Views count (tracked via analytics)
- Clicks count (tracked via analytics)
- Performance indicators with icons

#### Status Indicators
- **Active**: Currently running promotions (green badge)
- **Scheduled**: Future promotions (blue badge)
- **Ended**: Past promotions (gray badge)
- **Paid Status**: Shows if promotion was paid or free (emerald badge)

### 3. **Direct Event Promotion from Admin**
Admins can now promote any approved event directly:

#### Promote Button
- Added to all approved events in the grid view
- Purple-to-pink gradient button with Sparkles icon
- Located at the bottom of each event card

#### Promotion Modal Features
- **Event Information**: Shows event title and partner
- **Duration Selection**: Dropdown with preset options
  - 1 Day - KES 400
  - 3 Days - KES 1,200
  - 7 Days - KES 2,800
  - 14 Days - KES 5,600
  - 30 Days - KES 12,000
  
- **Scheduling Options**:
  - Start Date picker (minimum: today)
  - Start Time picker
  - Auto-calculates end date based on duration
  
- **Cost Summary**:
  - Duration display
  - Cost per day (KES 400)
  - Total cost calculation
  
- **Admin Privileges**: All admin promotions are FREE (is_free: true)

## Backend API Endpoints

### 1. Get Promoted Events
```
GET /api/admin/promoted-events
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Results per page (default: 50)
- `status`: Filter by status (active, ended, scheduled, all)

**Response:**
```json
{
  "promotions": [
    {
      "id": 1,
      "event_id": 123,
      "event_title": "Summer Music Festival",
      "partner_name": "Event Organizers Inc",
      "start_date": "2025-12-10T00:00:00",
      "end_date": "2025-12-17T00:00:00",
      "days_count": 7,
      "total_cost": 2800,
      "is_active": true,
      "is_paid": true,
      "views": 1250,
      "clicks": 340
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 1
}
```

### 2. Promote Event (Admin)
```
POST /api/admin/events/{event_id}/promote
```

**Request Body:**
```json
{
  "days_count": 7,
  "start_date": "2025-12-10T08:00:00Z",
  "end_date": "2025-12-17T08:00:00Z",
  "is_free": true
}
```

**Response:**
```json
{
  "message": "Event promoted successfully",
  "promotion": {
    "id": 1,
    "event_id": 123,
    "start_date": "2025-12-10T08:00:00",
    "end_date": "2025-12-17T08:00:00",
    "days_count": 7,
    "total_cost": 2800,
    "is_active": true,
    "is_paid": true
  }
}
```

## Frontend Components Modified

### 1. **EventsSection.tsx** (`/src/components/adminDashboard/`)
- Added state management for:
  - `activeTab`: Switches between 'all' and 'promoted' views
  - `promotedEvents`: Stores promoted events data
  - `showPromoteModal`: Controls promote modal visibility
  - `eventToPromote`: Selected event for promotion
  - `promoteDays`, `promoteStartDate`, `promoteStartTime`: Promotion settings

- Added components:
  - Tab navigation system
  - Promoted events table with comprehensive data
  - Promote event modal with form
  - Promote button on approved event cards

### 2. **api.ts** (`/src/config/`)
Added admin API endpoints:
```typescript
admin: {
  // ... existing endpoints
  promoteEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/promote`,
  promotedEvents: `${API_BASE_URL}/api/admin/promoted-events`,
}
```

## Backend Files Modified

### 1. **admin.py** (`/app/routes/`)
Added routes:
- `GET /api/admin/promoted-events`: Fetch all promoted events with filtering
- `POST /api/admin/events/<int:event_id>/promote`: Promote an event as admin

Added imports:
- `EventPromotion` from `app.models.event`

### 2. **event.py** (`/app/models/`)
Existing `EventPromotion` model used:
- `id`: Primary key
- `event_id`: Foreign key to events
- `start_date`: Promotion start date
- `end_date`: Promotion end date
- `days_count`: Duration in days
- `total_cost`: Total cost (KES 400/day)
- `is_active`: Active status
- `is_paid`: Payment status (true for admin promotions)
- `payment_id`: Optional payment reference

## User Experience

### Admin Workflow
1. Navigate to Events Section in admin dashboard
2. Click "Promoted Events" tab to view all promotions
3. See comprehensive table with event details, revenue, and reach metrics
4. To promote an event:
   - Switch to "All Events" tab
   - Find an approved event
   - Click "Promote Event" button (purple/pink gradient)
   - Select duration and schedule
   - Review cost summary
   - Click "Promote Event" to activate

### Status Tracking
- **Active Promotions**: Shows days remaining
- **Scheduled Promotions**: Shows future start date
- **Ended Promotions**: Archived with full metrics

## Benefits

### For Admins
- Complete visibility of all promoted events
- Direct control over event promotion
- No payment processing required (admin promotions are free)
- Track revenue generated from paid promotions
- Monitor event reach and performance

### For Platform
- Centralized promotion management
- Revenue tracking from partner-paid promotions
- Performance analytics integration ready
- Flexible scheduling system
- Professional admin interface

## Technical Implementation Details

### State Management
- Uses React hooks (useState, useEffect)
- Automatic data refresh on tab switch
- Real-time status calculations (active/scheduled/ended)

### Styling
- Tailwind CSS with responsive breakpoints
- Dark mode support throughout
- Gradient buttons for premium feel
- Status badges with color coding
- Professional table design

### Error Handling
- Toast notifications for success/error
- Input validation (date/time cannot be in past)
- Loading states during API calls
- Graceful fallbacks for empty states

### Data Flow
1. Admin clicks Promoted Events tab
2. Frontend fetches from `/api/admin/promoted-events`
3. Backend joins EventPromotion with Event and Partner tables
4. Returns enriched data with event/partner details
5. Frontend displays in responsive table format

## Future Enhancements

### Analytics Integration
- Track actual views and clicks per promotion
- Generate performance reports
- ROI calculations for paid promotions
- Conversion tracking (views → event page visits → bookings)

### Advanced Features
- Bulk promotion management
- Promotion templates/presets
- Email notifications to partners when promoted
- A/B testing different promotion durations
- Promotion history and comparison

### Reporting
- Revenue reports by time period
- Top performing promoted events
- Partner promotion history
- Export functionality (CSV/PDF)

## Notes
- Admin promotions are always marked as `is_free: true` in the backend
- Cost tracking remains for financial reporting even on free promotions
- All date/time handling uses ISO 8601 format
- Timezone handling uses UTC on backend, local display on frontend
- Promotion status is calculated dynamically based on current time vs start/end dates
