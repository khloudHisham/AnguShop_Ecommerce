import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../../Services/authentication.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule, 
    ReactiveFormsModule,
    RouterModule, 
    CommonModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditing = false;
  currentUser: any = null;
  profileImage: string = 'https://randomuser.me/api/portraits/men/40.jpg';
  activeTab: 'personal' | 'password' = 'personal';
  passwordChangeSuccess = false;
  passwordChangeError = '';
  isUploadingImage = false;
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  currentPasswordValue = '';
  showPasswordConfirmation = false;
  confirmPasswordToShow = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      birthday: ['']
    });
    this.profileForm.disable();

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.currentPasswordValue = this.authService.getCurrentPassword() || '';
    this.passwordForm.patchValue({
      currentPassword: this.getMaskedPassword()
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword?.value !== confirmPassword?.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  loadCurrentUser(): void {
    const user = this.authService.getCurrentUserProfile();
    if (user) {
      this.currentUser = user;
      this.profileImage = user.profile?.image || this.profileImage;
      
      this.profileForm.patchValue({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        email: user.email,
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        birthday: user.profile?.birthday || ''
      });
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.match('image.*')) {
        this.passwordChangeError = 'Only image files are allowed';
        setTimeout(() => this.passwordChangeError = '', 3000);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.passwordChangeError = 'Image must be less than 2MB';
        setTimeout(() => this.passwordChangeError = '', 3000);
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
      
      if (this.currentUser?.email) {
        this.currentUser.profile = this.currentUser.profile || {};
        this.currentUser.profile.image = imageData;
        
        this.authService.updateUserProfileImage(this.currentUser.email, imageData);
        this.authService.setCurrentUser(this.currentUser);
      }
      
      this.isUploadingImage = false;
    };

    reader.readAsDataURL(file);
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
      this.profileForm.get('email')?.disable();
    } else {
      this.profileForm.disable();
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const profileData = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        phone: this.profileForm.value.phone,
        location: this.profileForm.value.location,
        birthday: this.profileForm.value.birthday
      };

      if (this.authService.updateUserProfile(profileData)) {
        this.isEditing = false;
        this.profileForm.disable();
        this.loadCurrentUser();
      }
    }
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current' && !this.showCurrentPassword) {
      this.requestPasswordConfirmation();
      return;
    }

    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  requestPasswordConfirmation(): void {
    this.showPasswordConfirmation = true;
    this.confirmPasswordToShow = '';
  }

  confirmShowPassword(): void {
    if (this.confirmPasswordToShow === this.currentPasswordValue) {
      this.showCurrentPassword = true;
      this.showPasswordConfirmation = false;
      setTimeout(() => {
        this.showCurrentPassword = false;
      }, 15000);
    } else {
      this.passwordChangeError = 'Incorrect confirmation password';
      setTimeout(() => {
        this.passwordChangeError = '';
      }, 3000);
    }
    this.confirmPasswordToShow = '';
  }

  cancelShowPassword(): void {
    this.showPasswordConfirmation = false;
    this.confirmPasswordToShow = '';
  }

  getMaskedPassword(): string {
    return this.currentPasswordValue.replace(/./g, '•');
  }

  changePassword(): void {
    this.passwordChangeSuccess = false;
    this.passwordChangeError = '';

    if (this.passwordForm.invalid) {
      return;
    }

    const currentPassword = this.passwordForm.value.currentPassword === this.getMaskedPassword() 
      ? this.currentPasswordValue 
      : this.passwordForm.value.currentPassword;

    const { newPassword } = this.passwordForm.value;
    const user = this.authService.getCurrentUserProfile();

    if (!user) {
      this.passwordChangeError = 'User not found';
      return;
    }

    if (!this.showCurrentPassword && user.password !== currentPassword) {
      this.passwordChangeError = 'Current password is incorrect';
      return;
    }

    if (this.authService.updatePassword(newPassword)) {
      this.currentPasswordValue = newPassword;
      this.passwordChangeSuccess = true;
      this.passwordForm.patchValue({
        currentPassword: this.getMaskedPassword(),
        newPassword: '',
        confirmPassword: ''
      });
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
    } else {
      this.passwordChangeError = 'Failed to update password';
    }
  }

  onCurrentPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.showCurrentPassword) {
      input.value = this.getMaskedPassword();
    } else {
      this.currentPasswordValue = input.value;
    }
  }

  switchTab(tab: 'personal' | 'password'): void {
    this.activeTab = tab;
    this.passwordChangeSuccess = false;
    this.passwordChangeError = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    
    if (tab === 'password') {
      this.passwordForm.reset({
        currentPassword: this.getMaskedPassword(),
        newPassword: '',
        confirmPassword: ''
      });
    }
  }
}