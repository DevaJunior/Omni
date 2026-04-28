export interface IUser {
    uid: string;
    role: 'user' | 'admin' | 'moderator';
    personal: {
        name: string;
        email: string;
        username: string;
        avatar: string;
        originalAvatar: string;
        bio: string;
        phone: string;
        location: string;
        isVerified: boolean;
        job: string;
        school: string;
        highlights: string[];
    };
    assets: {
        events: { organizedEventIds: string[] };
        shops: { ownedShopIds: string[] };
        realEstate: { ownedPropertyIds: string[] };
        jobs: { 
            postedJobIds: string[];
            appliedJobIds: string[];
        };
    };
    activity: { 
        orders: number; 
        tickets: string[]; 
        appointments: string[]; 
        favorites: string[];
    };
    gamification: { 
        xp: number; 
        level: number; 
        coins: number; 
    };
    dating: { 
        isActive: boolean; 
    };
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}
