// src/services/apiTypes.ts

export type AssetStatus = "IN_STOCK" | "ASSIGNED" | "UNDER_REPAIR" | "DISPOSED";
export type VerificationStatus = "VERIFIED" | "NOT_VERIFIED" | "PENDING";
export type CheckInType = "OFFICE" | "OUTLET";

export interface Manufacturer {
  _id: string;
  name: string;
  code?: string;
}

export interface OutletRef {
  _id: string;
  name: string;
  outletCode?: string;
  code?: string;
  type?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  status?: string;
  district?:
    | {
        _id?: string;
        name?: string;
        code?: string;
        region?: {
          _id?: string;
          name?: string;
          code?: string;
        };
      }
    | string;
  distributor?:
    | {
        _id?: string;
        name?: string;
        code?: string;
      }
    | string
    | null;
}

export interface RegionRef {
  _id: string;
  name: string;
  code?: string;
  status?: string;
}

export interface DistrictRef {
  _id: string;
  name: string;
  code?: string;
  region?: string | RegionRef;
  status?: string;
}

export interface DistributorRef {
  _id: string;
  name: string;
  code?: string;
  district?: string | DistrictRef;
  status?: string;
}

export interface Asset {
  _id: string;
  ain: string;
  serialNumber: string;
  capacity?: number;
  manufacturingMonth?: number;
  manufacturingYear?: number;
  status: AssetStatus;
  verificationStatus?: VerificationStatus;
  isActivated?: boolean;
  manufacturer?: Manufacturer | null;
  currentOutlet?: OutletRef | null;
  qrCodeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetHistoryRecord {
  _id: string;
  asset: string | Asset;
  action:
    | "CREATED"
    | "ASSIGNED"
    | "TRANSFERRED"
    | "RETURNED"
    | "DISPOSED"
    | "REPAIRED";
  fromOutlet?: OutletRef | null;
  toOutlet?: OutletRef | null;
  performedBy?: { _id: string; name: string; email: string; role?: string };
  remarks?: string;
  createdAt: string;
}

export interface CheckInRecord {
  _id: string;
  user: { _id: string; name: string; email: string };
  checkInType: CheckInType;
  outlet?: OutletRef | null;
  latitude: number;
  longitude: number;
  remarks?: string;
  checkInTime: string;
}

export interface AssetRequestItem {
  _id: string;
  requestedBy: { _id: string; name: string; email: string };
  outlet: OutletRef;
  quantity: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remarks?: string;
  createdAt: string;
}

export interface RepairItem {
  _id: string;
  asset: Asset;
  requestedBy: { _id: string; name: string; email: string };
  issueDescription: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  remarks?: string;
  createdAt: string;
}
