import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modals: any[] = [];
  private modalState = new BehaviorSubject<{id: string, isOpen: boolean, data: any} | null>(null);

  modalState$ = this.modalState.asObservable();

  add(modal: any) {
    this.modals.push(modal);
  }

  remove(id: string) {
    this.modals = this.modals.filter(x => x.id !== id);
  }

  open(id: string, data?: any) {
    this.modalState.next({id, isOpen: true, data});
  }

  close(id: string) {
    this.modalState.next({id, isOpen: false, data: null});
  }
}