# Admin Event Promotion - Quick Start Guide

## 🎯 What's New

### 1. **Promoted Events Tab**
Navigate to **Admin Dashboard → Events Section** and you'll see two tabs:
- **All Events** (existing view)
- **Promoted Events** ⭐ (NEW)

### 2. **View Promoted Events**
Click the "Promoted Events" tab to see a comprehensive table showing:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Event             │ Partner     │ Duration │ Revenue  │ Reach          │
├─────────────────────────────────────────────────────────────────────────┤
│ Summer Festival   │ EventCo     │ 7 days   │ KES      │ 👁 1,250 views │
│ Dec 10 - Dec 17   │             │ 2 days   │ 2,800    │ 🎯 340 clicks  │
│                   │             │ left     │          │                │
│ Status: 🟢 Active | 💰 Paid                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ Music Night       │ ArtsCorp    │ 3 days   │ KES      │ 👁 850 views   │
│ Dec 20 - Dec 23   │             │          │ 1,200    │ 🎯 120 clicks  │
│ Status: 🔵 Scheduled | 💰 Paid                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Status Colors:**
- 🟢 **Active** (green) - Currently running
- 🔵 **Scheduled** (blue) - Starting in the future
- ⚫ **Ended** (gray) - Promotion completed

### 3. **Promote Any Event**

#### Step 1: Find an Approved Event
- Go to "All Events" tab
- Look for events with status "Approved"

#### Step 2: Click "Promote Event" Button
Each approved event card now has a purple-to-pink gradient button at the bottom:

```
┌──────────────────────────────────┐
│  🖼 Event Image                   │
│                                   │
│  📍 Status: APPROVED              │
├───────────────────────────────────┤
│  Summer Music Festival            │
│  🏷 Music                          │
│  👤 Event Organizers Inc          │
│  📅 Dec 15, 2025                  │
├───────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │ ⭐ Promote Event             │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

#### Step 3: Configure Promotion

A modal appears with the following options:

```
┌─────────────────────────────────────────────┐
│ ⭐ Promote Event                       ✕    │
├─────────────────────────────────────────────┤
│                                             │
│  📋 Event: Summer Music Festival            │
│  by Event Organizers Inc                    │
│                                             │
│  ⏱ Promotion Duration                       │
│  ┌──────────────────────────────────────┐  │
│  │ ▼ 7 Days - KES 2,800                 │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  📅 Start Date        ⏰ Start Time         │
│  ┌────────────────┐  ┌─────────────────┐  │
│  │ 2025-12-10     │  │ 08:00           │  │
│  └────────────────┘  └─────────────────┘  │
│                                             │
│  ╔═══════════════════════════════════════╗ │
│  ║ Duration:        7 days               ║ │
│  ║ Cost per day:    KES 400              ║ │
│  ║ ─────────────────────────────────────  ║ │
│  ║ Total Cost:      KES 2,800            ║ │
│  ╚═══════════════════════════════════════╝ │
│                                             │
│  ┌──────────┐  ┌──────────────────────┐   │
│  │ Cancel   │  │ ⭐ Promote Event      │   │
│  └──────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Duration Options:**
- 1 Day - KES 400
- 3 Days - KES 1,200
- 7 Days - KES 2,800 (recommended)
- 14 Days - KES 5,600
- 30 Days - KES 12,000

**Important:** Admin promotions are FREE for partners - this is a platform benefit!

## 🔑 Key Features

### Promoted Events Table Columns

| Column | Description |
|--------|-------------|
| **Event** | Event title, partner name, and date range of promotion |
| **Partner** | Business name of event organizer |
| **Duration** | Total days promoted + days remaining (if active) |
| **Revenue** | Total cost and per-day breakdown |
| **Reach** | Views and clicks (analytics) |
| **Status** | Active/Scheduled/Ended + Paid indicator |

### Status Indicators

**Promotion Status:**
- Active: Green badge - "Active"
- Scheduled: Blue badge - "Scheduled"
- Ended: Gray badge - "Ended"

**Payment Status:**
- Green badge with "Paid" indicates promotion was completed (admin or partner-paid)

### Date & Time Scheduling

- **Start Date**: Must be today or future date
- **Start Time**: Set specific time (24-hour format)
- **End Date**: Auto-calculated based on duration
- System prevents scheduling in the past

## 📊 Metrics Tracked

For each promoted event, you can monitor:

1. **Views** 👁 - Number of times event was seen in promoted section
2. **Clicks** 🎯 - Number of times users clicked through to event details
3. **Revenue** 💰 - Total cost of promotion (for reporting)
4. **Duration** ⏱ - How many days event is/was promoted

## 🎨 UI/UX Features

### Tab Navigation
```
┌────────────────────────────────────────────┐
│ ┌──────────────┐ ┌───────────────────────┐│
│ │ All Events   │ │ ⭐ Promoted Events   ││
│ └──────────────┘ └───────────────────────┘│
│ ═══════════════                            │
└────────────────────────────────────────────┘
```

- Active tab highlighted with blue underline
- Sparkles icon (⭐) on Promoted Events tab
- Smooth transitions between tabs
- Dark mode support

### Responsive Design
- **Mobile**: Single column table, stacked data
- **Tablet**: 2 columns
- **Desktop**: Full table with all columns
- **Large screens**: Optimized spacing

### Loading States
- Spinner while fetching data
- "No promoted events yet" with icon when empty
- Smooth loading transitions

## 🔐 Permissions

**Admin Only Features:**
- View all promoted events across all partners
- Promote any approved event
- Free promotion (no payment required)
- Schedule future promotions
- Access to full analytics

## 📈 Business Value

### For Admins
- ✅ Full visibility into platform promotions
- ✅ Control which events get premium visibility
- ✅ Track promotion revenue
- ✅ Monitor event performance
- ✅ Support partners with free promotion

### For Platform
- ✅ Revenue tracking from paid promotions
- ✅ Engagement metrics (views/clicks)
- ✅ Partner relationship management
- ✅ Event discoverability improvement

## 🚀 API Integration

The feature uses two new endpoints:

1. **GET /api/admin/promoted-events**
   - Fetch all promotions with event/partner details
   - Filter by status (active, scheduled, ended)
   - Pagination support

2. **POST /api/admin/events/:id/promote**
   - Promote any approved event
   - Set custom duration and schedule
   - Admin promotions marked as free

## 🎯 Best Practices

### When to Promote Events
1. **High-value events** - Major festivals, concerts, conferences
2. **New partners** - Support new organizers building audience
3. **Slow sales** - Boost events that need visibility
4. **Strategic timing** - Before event date for max impact

### Recommended Durations
- **Small events**: 1-3 days
- **Medium events**: 7 days (most popular)
- **Major events**: 14-30 days

### Scheduling Tips
- Start promotions 2-4 weeks before event date
- Avoid overlapping too many promotions
- Consider partner's timezone for start time
- Monitor performance and adjust strategy

## 🐛 Troubleshooting

**Promote button not showing?**
- Event must have "Approved" status
- Only works in "All Events" tab
- Refresh page if needed

**Cannot select past dates?**
- Start date/time must be current or future
- Check your system time is correct

**Promoted events not showing?**
- Switch to "Promoted Events" tab
- Check if any promotions exist
- Try refreshing the page

**Revenue showing KES 0?**
- Admin promotions are free (by design)
- Revenue tracked for reporting only
- Shows actual value for partner-paid promotions

## 📝 Notes

- Admin promotions do NOT charge the partner
- Cost values tracked for internal reporting
- All promotions appear in "Can't Miss" section on user-facing site
- Analytics (views/clicks) updated in real-time
- Promotion history preserved after end date

---

**For Support:** Contact development team or check `/PROMOTED_EVENTS_ADMIN.md` for technical details.
