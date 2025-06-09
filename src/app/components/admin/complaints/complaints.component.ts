import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintService } from '../../../../Services/complaint.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.css']
})
export class ComplaintsComponent implements OnInit {
  complaints: any[] = [];
  showDeleteModal: boolean = false;
  complaintToDelete: number | null = null;

  constructor(private complaintService: ComplaintService) {}

  ngOnInit(): void {
    this.complaints = this.complaintService.getComplaints();
  }

  initiateDelete(index: number): void {
    this.complaintToDelete = index;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.complaintToDelete !== null) {
      this.complaints.splice(this.complaintToDelete, 1);
      this.complaintService.updateComplaints(this.complaints);
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.complaintToDelete = null;
  }
}