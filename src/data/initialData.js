// Seed data for the Linkmrs prototype.
// Images use Picsum (free placeholder photo service) seeded for consistency.

export const MAX_PRODUCTS = 10;

export const initialShopProfile = {
  shopName: 'Studio Curate',
  bio: 'Purposefully designed essentials for the modern workplace. Elevating your daily business infrastructure through minimalist aesthetics.',
  location: 'London, UK',
  logo: 'https://picsum.photos/seed/Linkmrs-logo/200/200',
  rating: 4.9,
  reviewCount: 210,
  currency: '$',
  whatsappNumber: '15550123456'
};

export const initialProducts = [
  {
    id: 'prod-1',
    name: 'Architect Linen Shirt',
    price: 85,
    description: 'Tailored breathable linen for creators.',
    image: 'https://picsum.photos/seed/Linkmrs-shirt/600/600'
  },
  {
    id: 'prod-2',
    name: 'Executive Notebook',
    price: 42,
    description: 'Italian leather, thread-bound perfection.',
    image: 'https://picsum.photos/seed/Linkmrs-notebook/600/600'
  },
  {
    id: 'prod-3',
    name: 'Creator\u2019s Viewfinder',
    price: 320,
    description: 'Refurbished 35mm excellence.',
    image: 'https://picsum.photos/seed/Linkmrs-camera/600/600'
  },
  {
    id: 'prod-4',
    name: 'Focus Headphones',
    price: 195,
    description: 'Active noise cancellation for deep work.',
    image: 'https://picsum.photos/seed/Linkmrs-headphones/600/600'
  },
  {
    id: 'prod-5',
    name: 'Standard Watch',
    price: 120,
    description: 'Japanese movement, sapphire glass.',
    image: 'https://picsum.photos/seed/Linkmrs-watch/600/600'
  }
];
