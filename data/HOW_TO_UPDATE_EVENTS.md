# How to Update Events

This guide explains how non-technical members can add or update events on the website without touching any code.

## Where is the data?
All events are stored in the file: `data/events.json`

## How to add a new event
1. Open `data/events.json` in GitHub (or your code editor).
2. You will see a list of events enclosed in curly braces `{ ... }`.
3. To add a new event, copy the format of an existing event and add it to the list, separated by a comma.

### Event Format Reference
```json
{
  "id": 4, 
  "title": "Your Event Title",
  "date": "2026-04-20", // Must be YYYY-MM-DD
  "time": "5:00 PM - 7:00 PM EST",
  "location": "Room 123, Student Center",
  "description": "A brief description of what the event is about.",
  "category": "Networking", // E.g., Networking, Career, Science & Tech, Workshop
  "link": "https://link-to-tickets-or-rsvp.com",
  "images": [
    "/media/Group_photo.jpg",
    "/media/DSC_0154.JPG"
  ] // (Optional) Add image paths for past events
}
```

### Important Rules
- **Formatting**: Make sure you don't miss any commas between properties or between events. JSON is very strict about formatting.
- **Images**: If an event has already happened and you have photos, place the photos inside the `public/media` folder. Then, refer to them inside the `"images"` array as `"/media/your-file-name.jpg"`. If there are no images, you can omit the `"images"` property entirely or leave it empty `[]`.
- **IDs**: Each event should have a unique `"id"` number.
- **Date**: The date MUST be in `YYYY-MM-DD` format (e.g., `2026-02-14`). This is how the website sorts Upcoming vs Past events.

## Publishing
Once you edit and save the `data/events.json` file in GitHub (commit the changes), the website will automatically rebuild and your new events will be live!
