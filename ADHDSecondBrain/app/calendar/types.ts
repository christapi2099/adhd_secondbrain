/**
 * Types for the calendar functionality
 */

// Calendar event type
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  location?: string;
  category: EventCategory;
  color: string;
  googleEventId?: string; // For events imported from Google Calendar
}

// Event categories
export type EventCategory = 
  | 'work' 
  | 'personal' 
  | 'health' 
  | 'education' 
  | 'social' 
  | 'other';

// Category colors (based on Google's color palette)
export const CategoryColors: Record<EventCategory, string> = {
  work: '#4285F4',      // Google blue
  personal: '#FBBC05',  // Google yellow
  health: '#34A853',    // Google green
  education: '#EA4335', // Google red
  social: '#8430CE',    // Purple
  other: '#80868B',     // Gray
};

// View types
export type CalendarViewType = 'daily' | 'weekly' | 'monthly';

// Google Calendar integration types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  colorId?: string;
}

// Function to convert Google Calendar event to our CalendarEvent format
export function convertGoogleEvent(googleEvent: GoogleCalendarEvent): CalendarEvent {
  return {
    id: `google-${googleEvent.id}`,
    title: googleEvent.summary,
    description: googleEvent.description,
    start: new Date(googleEvent.start.dateTime),
    end: new Date(googleEvent.end.dateTime),
    location: googleEvent.location,
    category: 'other', // Default category, can be customized
    color: CategoryColors.other, // Default color
    googleEventId: googleEvent.id,
  };
}