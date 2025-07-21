export interface IProperty {
    id: number;
    owner_id: number;
    title: string;
    description?: string;
    location: string;
    monthly_rent: number;
    currency: string;
    expense_price: number;
    environments: number;
    bathrooms: number;
    garages: number;
    approx_m2: number;
    rental_period: number;
    bedrooms: number;
    rating: number;
    image?: string;
    all_images?: string[];
    status: string;
    created_at: string;
    updated_at: string;
  }