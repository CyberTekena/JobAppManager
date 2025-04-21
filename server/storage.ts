import { users, applications, notes, timelineEvents } from "@shared/schema";
import type { User, InsertUser, Application, InsertApplication, Note, InsertNote, TimelineEvent, InsertTimelineEvent } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Application methods
  getApplications(userId: number): Promise<Application[]>;
  getApplicationById(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication, userId: number): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  
  // Notes methods
  getNotes(applicationId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: number): Promise<boolean>;
  
  // Timeline methods
  getTimelineEvents(applicationId: number): Promise<TimelineEvent[]>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  
  // Stats
  getApplicationStats(userId: number): Promise<{
    total: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  }>;
  
  // Session storage
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private applications: Map<number, Application>;
  private notes: Map<number, Note>;
  private timelineEvents: Map<number, TimelineEvent>;
  private userIdCounter: number;
  private applicationIdCounter: number;
  private noteIdCounter: number;
  private timelineEventIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.applications = new Map();
    this.notes = new Map();
    this.timelineEvents = new Map();
    this.userIdCounter = 1;
    this.applicationIdCounter = 1;
    this.noteIdCounter = 1;
    this.timelineEventIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Application methods
  async getApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.userId === userId
    );
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(application: InsertApplication, userId: number): Promise<Application> {
    const id = this.applicationIdCounter++;
    const newApplication: Application = { 
      ...application, 
      id, 
      userId,
      appliedDate: application.appliedDate || new Date(),
      tags: application.tags || []
    };
    this.applications.set(id, newApplication);
    
    // Automatically add an 'applied' timeline event
    await this.createTimelineEvent({
      applicationId: id,
      userId,
      eventType: "applied",
      eventDate: newApplication.appliedDate,
      description: `Applied for ${application.jobTitle} at ${application.company}`
    });
    
    return newApplication;
  }

  async updateApplication(id: number, applicationData: Partial<InsertApplication>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...applicationData };
    this.applications.set(id, updatedApplication);
    
    // If status changed, add timeline event
    if (applicationData.status && applicationData.status !== application.status) {
      await this.createTimelineEvent({
        applicationId: id,
        userId: application.userId,
        eventType: applicationData.status,
        eventDate: new Date(),
        description: `Status changed to ${applicationData.status}`
      });
    }
    
    return updatedApplication;
  }

  async deleteApplication(id: number): Promise<boolean> {
    // Delete related notes and timeline events
    Array.from(this.notes.entries())
      .filter(([_, note]) => note.applicationId === id)
      .forEach(([noteId]) => this.notes.delete(noteId));
      
    Array.from(this.timelineEvents.entries())
      .filter(([_, event]) => event.applicationId === id)
      .forEach(([eventId]) => this.timelineEvents.delete(eventId));
    
    return this.applications.delete(id);
  }

  // Notes methods
  async getNotes(applicationId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.applicationId === applicationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.noteIdCounter++;
    const newNote: Note = { 
      ...note, 
      id, 
      createdAt: new Date(),
      updatedAt: null
    };
    this.notes.set(id, newNote);
    return newNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Timeline methods
  async getTimelineEvents(applicationId: number): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values())
      .filter(event => event.applicationId === applicationId)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = this.timelineEventIdCounter++;
    const newEvent: TimelineEvent = {
      ...event,
      id,
      createdAt: new Date(),
      details: event.details || {}
    };
    this.timelineEvents.set(id, newEvent);
    return newEvent;
  }

  // Stats
  async getApplicationStats(userId: number): Promise<{
    total: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  }> {
    const userApplications = await this.getApplications(userId);
    
    return {
      total: userApplications.length,
      applied: userApplications.filter(app => app.status === "applied").length,
      interview: userApplications.filter(app => app.status === "interview").length,
      offer: userApplications.filter(app => app.status === "offer").length,
      rejected: userApplications.filter(app => app.status === "rejected").length
    };
  }
}

export const storage = new MemStorage();
