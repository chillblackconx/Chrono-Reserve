export enum SlotStatus {
  Available = 'AVAILABLE',
  Selected = 'SELECTED',
  Disabled = 'DISABLED',
}

export type DisabledReason = 'BOOKED' | 'CLASS_PART' | 'BREAK' | 'TOO_CLOSE' | null;

export interface TimeSlot {
  id: string;
  startTime: Date;
  status: SlotStatus;
  reason: DisabledReason;
}

export interface User {
  uid: string;
  username: string; // Will be the email
  name: string;
}