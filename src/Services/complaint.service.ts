// src/app/services/complaint.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private localStorageKey = 'complaints';
  private complaints: any[] = [];

  constructor() {
    this.loadComplaints();
  }

  private loadComplaints(): void {
    const stored = localStorage.getItem(this.localStorageKey);
    this.complaints = stored ? JSON.parse(stored) : [];
  }

  private saveComplaints(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.complaints));
  }

  getComplaints(): any[] {
    return this.complaints;
  }

  addComplaint(complaint: any): void {
    this.complaints.push(complaint);
    this.saveComplaints();
  }

  updateComplaints(updatedList: any[]): void {
    this.complaints = updatedList;
    this.saveComplaints();
  }
}


