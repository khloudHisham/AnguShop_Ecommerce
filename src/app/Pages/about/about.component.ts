import { Component, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; 
import * as L from 'leaflet';  
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; 
import { ComplaintService } from '../../../Services/complaint.service'; 

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class AboutComponent implements AfterViewInit {
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    location: ''
  };

  map: any;
  marker: any;

  constructor(
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private http: HttpClient,
    private complaintService: ComplaintService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  initMap(): void {
    this.ngZone.runOutsideAngular(() => {
      this.map = L.map('map').setView([30.044453131525962, 31.23577937667665], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      const icon = L.icon({
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      this.marker = L.marker([30.0444, 31.2357], { icon, draggable: true }).addTo(this.map);

      this.marker.on('dragend', (e: any) => {
        const lat = e.target.getLatLng().lat.toFixed(4);
        const lng = e.target.getLatLng().lng.toFixed(4);
        this.ngZone.run(() => this.getAddressFromCoordinates(lat, lng));
      });

      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    });
  }

  getAddressFromCoordinates(lat: string, lng: string): void {
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    this.http.get(apiUrl).subscribe((response: any) => {
      if (response?.display_name) {
        this.formData.location = response.display_name;
      } else {
        this.formData.location = 'Address not found';
      }
    }, () => {
      this.formData.location = 'Address not found';
    });
  }

  onSubmit(form: any) {
    if (form.valid) {
      // ✅ Save the complaint
      this.complaintService.addComplaint({ ...this.formData });

      Swal.fire({
        title: 'Success!',
        text: 'Your message has been sent successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        this.formData = {
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          location: ''
        };
        form.resetForm();
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill out the form correctly.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }
}
