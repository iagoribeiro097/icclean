export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  benefits: string[];
}

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  address: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  notes?: string;
  createdAt: string;
}

export interface BeforeAfterImage {
  title: string;
  beforeUrl: string;
  afterUrl: string;
  description: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  createdAt: string;
}
