import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../Services/authentication.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  profile = {
    username: '',
    firstName: '',
    lastName: '',
    location: '',
    email: '',
    phone: '',
    birthday: ''
  };
  
  profileImage: string = 'http://bootdey.com/img/Content/avatar/avatar1.png';
  isUploadingImage = false;

  constructor(private router: Router, private authService: AuthenticationService) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUserProfile();

    if (user) {
      this.profile.email = user.email;
      this.profile.username = user.profile?.username || user.email.split('@')[0];
      this.profile.firstName = user.profile?.firstName || '';
      this.profile.lastName = user.profile?.lastName || '';
      this.profile.location = user.profile?.location || '';
      this.profile.phone = user.profile?.phone || '';
      this.profile.birthday = user.profile?.birthday || '';
      
      // Set profile image if exists
      if (user.profile?.image) {
        this.profileImage = user.profile.image;
      }
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        Swal.fire({
          title: 'Error!',
          text: 'Only image files are allowed',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'Error!',
          text: 'Image must be less than 5MB',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        return;
      }

      this.uploadProfileImage(file);
    }
  }

  uploadProfileImage(file: File): void {
    this.isUploadingImage = true;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const imageData = e.target.result;
      this.profileImage = imageData;
      
      const user = this.authService.getCurrentUserProfile();
      if (user?.email) {
        // Update the user object
        user.profile = user.profile || {};
        user.profile.image = imageData;
        
        // Save using the service
        this.authService.updateUserProfileImage(user.email, imageData);
        this.authService.setCurrentUser(user);
      }
      
      this.isUploadingImage = false;
      
      Swal.fire({
        title: 'Success!',
        text: 'Profile image updated successfully!',
        icon: 'success',
        confirmButtonText: 'Ok'
      });
    };

    reader.onerror = () => {
      this.isUploadingImage = false;
      Swal.fire({
        title: 'Error!',
        text: 'Failed to upload image',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    };

    reader.readAsDataURL(file);
  }

  saveChanges() {
    const user = this.authService.getCurrentUserProfile();
    if (!user) return;

    const profileData = {
      username: this.profile.username,
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      location: this.profile.location,
      phone: this.profile.phone,
      birthday: this.profile.birthday
    };

    this.authService.updateUserProfile(profileData);

    Swal.fire({
      title: 'Success!',
      text: 'Your profile has been successfully updated!',
      icon: 'success',
      confirmButtonText: 'Ok'
    });
  }

  cancel() {
    this.router.navigate(['/products']);
  }
}