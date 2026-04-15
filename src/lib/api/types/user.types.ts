import type { EntityId, ExtensibleStringUnion, ISODateString } from "./common.types";

export type UserStatus = ExtensibleStringUnion<"Active" | "Inactive" | "Pending" | "Blacklisted">;

export interface UserListRow {
    id: EntityId;
    organization: string;
    username: string;
    email: string;
    phone_number: string;
    date: ISODateString;
    status: UserStatus;
}

export interface UserDetailsData {
    id: EntityId;
    fullName: string;
    userId: string;
    tier: number;
    balance: string;
    accountNumber: number;
    bank: string;
    username?: string;
    organization?: string;
    email?: string;
    phone_number?: string;
    date?: ISODateString;
    status?: UserStatus;
    personalInfo: {
        fullName: string;
        phoneNumber: string;
        email: string;
        bvn: number;
        gender: string;
        maritalStatus: string;
        children: number;
        residenceType: string;
    };
    educationEmployment: {
        level: string;
        employmentStatus: string;
        sector: string;
        duration: string;
        officeEmail: string;
        monthlyIncome: string;
        loanRepayment: string;
    };
    socials: {
        twitter: string;
        facebook: string;
        instagram: string;
    };
    guarantors: Array<{
        fullName: string;
        phoneNumber: string;
        email: string;
        relationship: string;
    }>;
}
