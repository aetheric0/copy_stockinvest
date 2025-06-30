export type EmailNotifications = {
    marketUpdates: boolean;
    securityAlerts: boolean;
    transactionNotifications: boolean;
    newsletter: boolean;
}

export type Preferences = {
    defaultCurrency: string;
    theme: 'system' | 'light' | 'dark'
    emailNotifications: EmailNotifications;
}

export type User = {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
    createdAt?: string;
    preferences?: Preferences;
};

export type UserContextType = {
    user: User | null;
    loading: boolean;
    error: string | null;
    logout: () => void;
    fetchUser: () => Promise<void>;
}