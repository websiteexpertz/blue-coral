export interface SiteContentData {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    imageKey: string;
    imageSrc?: string;
    stats: Array<{ value: string; label: string }>;
  };
  about: {
    eyebrow: string;
    title: string;
    text: string;
    imageKey1: string;
    imageKey2: string;
    imageSrc1?: string;
    imageSrc2?: string;
    highlights: Array<{ title: string; description: string }>;
  };
  villaFeatures: {
    eyebrow: string;
    title: string;
    description: string;
    highlights: Array<{ title: string; description: string }>;
    footerItems: string[];
  };
  location: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ title: string; description: string; tag: string; key: string; src: string; alt: string }>;
    listTitle: string;
    listItems: string[];
    mapTitle: string;
    mapSubtitle: string;
    mapLink: string;
    mapImageKey: string;
    mapImageSrc?: string;
  };
  amenities: {
    eyebrow: string;
    title: string;
    text: string;
    highlights: Array<{ title: string; body: string }>;
    categories: Array<{ title: string; items: string[] }>;
  };
  rooms: {
    eyebrow: string;
    title: string;
    text: string;
    bedrooms: Array<{ title: string; details: string }>;
    bathrooms: string[];
    spaces: string[];
  };
  nearbyAttractions: {
    eyebrow: string;
    title: string;
    text: string;
    pills: string[];
    attractions: Array<{ name: string; description: string }>;
    restaurants: string[];
  };
  thingsToDo: {
    eyebrow: string;
    title: string;
    text: string;
    activities: string[];
    imageKey: string;
    imageSrc?: string;
  };
  houseRules: {
    eyebrow: string;
    title: string;
    rules: Array<{ label: string; value: string }>;
  };
  importantInformation: {
    eyebrow: string;
    title: string;
    notes: string[];
  };
  neighborhood: {
    eyebrow: string;
    title: string;
    text: string;
    mapLink: string;
    highlights: string[];
  };
  faq: {
    eyebrow: string;
    title: string;
    text: string;
    items: Array<{ question: string; answer: string }>;
  };
  guestReviews: {
    eyebrow: string;
    title: string;
    text: string;
    reviews: Array<{ quote: string; author: string }>;
  };
  contact: {
    eyebrow: string;
    title: string;
    text: string;
    email: string;
    phone: string;
    note: string;
  };
  footer: {
    socialLinks: Array<{ platform: string; url: string }>;
  };
}

export function normalizeSiteContent(input: Partial<SiteContentData> | SiteContentData): SiteContentData {
  return {
    hero: {
      eyebrow: input.hero?.eyebrow ?? DEFAULT_SITE_CONTENT.hero.eyebrow,
      title: input.hero?.title ?? DEFAULT_SITE_CONTENT.hero.title,
      subtitle: input.hero?.subtitle ?? DEFAULT_SITE_CONTENT.hero.subtitle,
      ctaPrimary: input.hero?.ctaPrimary ?? DEFAULT_SITE_CONTENT.hero.ctaPrimary,
      ctaSecondary: input.hero?.ctaSecondary ?? DEFAULT_SITE_CONTENT.hero.ctaSecondary,
      imageKey: input.hero?.imageKey ?? DEFAULT_SITE_CONTENT.hero.imageKey,
      imageSrc: input.hero?.imageSrc ?? DEFAULT_SITE_CONTENT.hero.imageSrc,
      stats: (input.hero?.stats ?? DEFAULT_SITE_CONTENT.hero.stats).map((item) => ({
        value: item?.value ?? '',
        label: item?.label ?? '',
      })),
    },
    about: {
      eyebrow: input.about?.eyebrow ?? DEFAULT_SITE_CONTENT.about.eyebrow,
      title: input.about?.title ?? DEFAULT_SITE_CONTENT.about.title,
      text: input.about?.text ?? DEFAULT_SITE_CONTENT.about.text,
      imageKey1: input.about?.imageKey1 ?? DEFAULT_SITE_CONTENT.about.imageKey1,
      imageSrc1: input.about?.imageSrc1 ?? DEFAULT_SITE_CONTENT.about.imageSrc1,
      imageKey2: input.about?.imageKey2 ?? DEFAULT_SITE_CONTENT.about.imageKey2,
      imageSrc2: input.about?.imageSrc2 ?? DEFAULT_SITE_CONTENT.about.imageSrc2,
      highlights: (input.about?.highlights ?? DEFAULT_SITE_CONTENT.about.highlights).map((item) => ({
        title: item?.title ?? '',
        description: item?.description ?? '',
      })),
    },
    villaFeatures: {
      eyebrow: input.villaFeatures?.eyebrow ?? DEFAULT_SITE_CONTENT.villaFeatures.eyebrow,
      title: input.villaFeatures?.title ?? DEFAULT_SITE_CONTENT.villaFeatures.title,
      description: input.villaFeatures?.description ?? DEFAULT_SITE_CONTENT.villaFeatures.description,
      highlights: (input.villaFeatures?.highlights ?? DEFAULT_SITE_CONTENT.villaFeatures.highlights).map((item) => ({
        title: item?.title ?? '',
        description: item?.description ?? '',
      })),
      footerItems: (input.villaFeatures?.footerItems ?? DEFAULT_SITE_CONTENT.villaFeatures.footerItems).map((item) => String(item ?? '')),
    },
    location: {
      eyebrow: input.location?.eyebrow ?? DEFAULT_SITE_CONTENT.location.eyebrow,
      title: input.location?.title ?? DEFAULT_SITE_CONTENT.location.title,
      description: input.location?.description ?? DEFAULT_SITE_CONTENT.location.description,
      cards: (input.location?.cards ?? DEFAULT_SITE_CONTENT.location.cards).map((item) => ({
        title: item?.title ?? '',
        description: item?.description ?? '',
        tag: item?.tag ?? '',
        key: item?.key ?? '',
        src: item?.src ?? '',
        alt: item?.alt ?? '',
      })),
      listTitle: input.location?.listTitle ?? DEFAULT_SITE_CONTENT.location.listTitle,
      listItems: (input.location?.listItems ?? DEFAULT_SITE_CONTENT.location.listItems).map((item) => String(item ?? '')),
      mapTitle: input.location?.mapTitle ?? DEFAULT_SITE_CONTENT.location.mapTitle,
      mapSubtitle: input.location?.mapSubtitle ?? DEFAULT_SITE_CONTENT.location.mapSubtitle,
      mapLink: input.location?.mapLink ?? DEFAULT_SITE_CONTENT.location.mapLink,
      mapImageKey: input.location?.mapImageKey ?? DEFAULT_SITE_CONTENT.location.mapImageKey,
      mapImageSrc: input.location?.mapImageSrc ?? DEFAULT_SITE_CONTENT.location.mapImageSrc,
    },
    amenities: {
      eyebrow: input.amenities?.eyebrow ?? DEFAULT_SITE_CONTENT.amenities.eyebrow,
      title: input.amenities?.title ?? DEFAULT_SITE_CONTENT.amenities.title,
      text: input.amenities?.text ?? DEFAULT_SITE_CONTENT.amenities.text,
      highlights: (input.amenities?.highlights ?? DEFAULT_SITE_CONTENT.amenities.highlights).map((item) => ({
        title: item?.title ?? '',
        body: item?.body ?? '',
      })),
      categories: (input.amenities?.categories ?? DEFAULT_SITE_CONTENT.amenities.categories).map((item) => ({
        title: item?.title ?? '',
        items: (item?.items ?? []).map((subitem) => String(subitem ?? '')),
      })),
    },
    rooms: {
      eyebrow: input.rooms?.eyebrow ?? DEFAULT_SITE_CONTENT.rooms.eyebrow,
      title: input.rooms?.title ?? DEFAULT_SITE_CONTENT.rooms.title,
      text: input.rooms?.text ?? DEFAULT_SITE_CONTENT.rooms.text,
      bedrooms: (input.rooms?.bedrooms ?? DEFAULT_SITE_CONTENT.rooms.bedrooms).map((item) => ({
        title: item?.title ?? '',
        details: item?.details ?? '',
      })),
      bathrooms: (input.rooms?.bathrooms ?? DEFAULT_SITE_CONTENT.rooms.bathrooms).map((item) => String(item ?? '')),
      spaces: (input.rooms?.spaces ?? DEFAULT_SITE_CONTENT.rooms.spaces).map((item) => String(item ?? '')),
    },
    nearbyAttractions: {
      eyebrow: input.nearbyAttractions?.eyebrow ?? DEFAULT_SITE_CONTENT.nearbyAttractions.eyebrow,
      title: input.nearbyAttractions?.title ?? DEFAULT_SITE_CONTENT.nearbyAttractions.title,
      text: input.nearbyAttractions?.text ?? DEFAULT_SITE_CONTENT.nearbyAttractions.text,
      pills: (input.nearbyAttractions?.pills ?? DEFAULT_SITE_CONTENT.nearbyAttractions.pills).map((item) => String(item ?? '')),
      attractions: (input.nearbyAttractions?.attractions ?? DEFAULT_SITE_CONTENT.nearbyAttractions.attractions).map((item) => ({
        name: item?.name ?? '',
        description: item?.description ?? '',
      })),
      restaurants: (input.nearbyAttractions?.restaurants ?? DEFAULT_SITE_CONTENT.nearbyAttractions.restaurants).map((item) => String(item ?? '')),
    },
    thingsToDo: {
      eyebrow: input.thingsToDo?.eyebrow ?? DEFAULT_SITE_CONTENT.thingsToDo.eyebrow,
      title: input.thingsToDo?.title ?? DEFAULT_SITE_CONTENT.thingsToDo.title,
      text: input.thingsToDo?.text ?? DEFAULT_SITE_CONTENT.thingsToDo.text,
      activities: (input.thingsToDo?.activities ?? DEFAULT_SITE_CONTENT.thingsToDo.activities).map((item) => String(item ?? '')),
      imageKey: input.thingsToDo?.imageKey ?? DEFAULT_SITE_CONTENT.thingsToDo.imageKey,
      imageSrc: input.thingsToDo?.imageSrc ?? DEFAULT_SITE_CONTENT.thingsToDo.imageSrc,
    },
    houseRules: {
      eyebrow: input.houseRules?.eyebrow ?? DEFAULT_SITE_CONTENT.houseRules.eyebrow,
      title: input.houseRules?.title ?? DEFAULT_SITE_CONTENT.houseRules.title,
      rules: (input.houseRules?.rules ?? DEFAULT_SITE_CONTENT.houseRules.rules).map((item) => ({
        label: item?.label ?? '',
        value: item?.value ?? '',
      })),
    },
    importantInformation: {
      eyebrow: input.importantInformation?.eyebrow ?? DEFAULT_SITE_CONTENT.importantInformation.eyebrow,
      title: input.importantInformation?.title ?? DEFAULT_SITE_CONTENT.importantInformation.title,
      notes: (input.importantInformation?.notes ?? DEFAULT_SITE_CONTENT.importantInformation.notes).map((item) => String(item ?? '')),
    },
    neighborhood: {
      eyebrow: input.neighborhood?.eyebrow ?? DEFAULT_SITE_CONTENT.neighborhood.eyebrow,
      title: input.neighborhood?.title ?? DEFAULT_SITE_CONTENT.neighborhood.title,
      text: input.neighborhood?.text ?? DEFAULT_SITE_CONTENT.neighborhood.text,
      mapLink: input.neighborhood?.mapLink ?? DEFAULT_SITE_CONTENT.neighborhood.mapLink,
      highlights: (input.neighborhood?.highlights ?? DEFAULT_SITE_CONTENT.neighborhood.highlights).map((item) => String(item ?? '')),
    },
    faq: {
      eyebrow: input.faq?.eyebrow ?? DEFAULT_SITE_CONTENT.faq.eyebrow,
      title: input.faq?.title ?? DEFAULT_SITE_CONTENT.faq.title,
      text: input.faq?.text ?? DEFAULT_SITE_CONTENT.faq.text,
      items: (input.faq?.items ?? DEFAULT_SITE_CONTENT.faq.items).map((item) => ({
        question: item?.question ?? '',
        answer: item?.answer ?? '',
      })),
    },
    guestReviews: {
      eyebrow: input.guestReviews?.eyebrow ?? DEFAULT_SITE_CONTENT.guestReviews.eyebrow,
      title: input.guestReviews?.title ?? DEFAULT_SITE_CONTENT.guestReviews.title,
      text: input.guestReviews?.text ?? DEFAULT_SITE_CONTENT.guestReviews.text,
      reviews: (input.guestReviews?.reviews ?? DEFAULT_SITE_CONTENT.guestReviews.reviews).map((item) => ({
        quote: item?.quote ?? '',
        author: item?.author ?? '',
      })),
    },
    contact: {
      eyebrow: input.contact?.eyebrow ?? DEFAULT_SITE_CONTENT.contact.eyebrow,
      title: input.contact?.title ?? DEFAULT_SITE_CONTENT.contact.title,
      text: input.contact?.text ?? DEFAULT_SITE_CONTENT.contact.text,
      email: input.contact?.email ?? DEFAULT_SITE_CONTENT.contact.email,
      phone: input.contact?.phone ?? DEFAULT_SITE_CONTENT.contact.phone,
      note: input.contact?.note ?? DEFAULT_SITE_CONTENT.contact.note,
    },
    footer: {
      socialLinks: (input.footer?.socialLinks ?? DEFAULT_SITE_CONTENT.footer.socialLinks).map((item) => ({
        platform: item?.platform ?? '',
        url: item?.url ?? '',
      })),
    },
  };
}

export const DEFAULT_SITE_CONTENT: SiteContentData = {
  hero: {
    eyebrow: 'Luxury Waterfront Vacation Rental',
    title: 'Blue Coral Landing, a private island hideaway on the Sea of Abaco.',
    subtitle:
      'Experience authentic island living with a private dock, breezy waterfront views, and easy access to the Atlantic in Great Guana Cay.',
    ctaPrimary: 'Reserve Your Stay',
    ctaSecondary: 'Explore the Cottage',
    imageKey: 'villa-hero',
    imageSrc: undefined,
    stats: [
      { value: '4', label: 'Bedrooms' },
      { value: '4', label: 'Bathrooms' },
      { value: '8', label: 'Guests' },
      { value: '$650', label: 'From / Night' },
    ],
  },
  about: {
    eyebrow: 'About this property',
    title: 'Blue Coral Landing 4 Bedroom 4 Bath With Dock, Guana Cay, Abaco, Bahamas.',
    text:
      'Blue Coral Landing is a four-bedroom, four-bathroom waterfront cottage with a dock on the Sea of Abaco, designed for relaxed luxury and unforgettable island stays. The villa features a new sunroom, a master dining room with wet bar, and a tower bedroom with sweeping views over the Sea of Abaco. Sleeps up to 8 guests and is located directly on the water, just a short walk to the Atlantic Ocean and close to restaurants, shops, and the famous Nippers.',
    imageKey1: 'villa-about-1',
    imageKey2: 'villa-about-2',
    imageSrc1: undefined,
    imageSrc2: undefined,
    highlights: [
      {
        title: 'Private Dock',
        description:
          'Step from the cottage to your own dock for boats, sunrise swims, and effortless island access.',
      },
      {
        title: 'Sea of Abaco Views',
        description:
          'Panoramic water views from the tower bedroom and sunroom create a front-row seat to the horizon.',
      },
      {
        title: '3-Minute Beach Walk',
        description:
          'Enjoy easy access to the Atlantic shoreline and the soft rhythm of island mornings.',
      },
      {
        title: 'Bahamian Charm',
        description:
          'Colorful architecture and warm interiors reflect the island’s signature Junkanoo spirit.',
      },
    ],
  },
  villaFeatures: {
    eyebrow: 'Villa Features',
    title: 'Everything You Need. Nothing You Don\'t.',
    description:
      'Blue Coral Landing is designed for those who appreciate the finer things — without sacrificing the soul of island living.',
    highlights: [
      {
        title: 'Four Bedrooms',
        description: 'Spacious, elegantly appointed bedrooms with premium linens and ocean-facing windows.',
      },
      {
        title: 'Four Bathrooms',
        description: 'En-suite and shared bathrooms finished to hotel standards.',
      },
      {
        title: 'Waterfront Views',
        description: "Uninterrupted views across Fisher's Bay from every vantage point.",
      },
      {
        title: 'Shared Dock',
        description:
          'Direct water access from a shared dock — perfect for arriving by boat or setting off to explore.',
      },
      {
        title: 'Prime Location',
        description:
          'Walking distance to renowned restaurants, pristine beaches, and the local grocery store. Great Guana Cay at your doorstep.',
      },
      {
        title: 'Backup Generator',
        description: 'Uninterrupted comfort with a full backup generator — peace of mind in paradise.',
      },
      {
        title: 'Air Conditioning',
        description: 'Full air conditioning throughout the villa, complemented by ceiling fans.',
      },
      {
        title: 'Fully Equipped Kitchen',
        description:
          'A chef-ready kitchen with everything you need for home-cooked meals, from morning coffee to sunset dinners.',
      },
    ],
    footerItems: ['Smart Speakers', 'Roku TV', 'YouTube TV', 'Ceiling Fans', 'Waterfront Porch', 'Two Living Areas', 'Dining Area'],
  },
  location: {
    eyebrow: 'Location',
    title: 'Great Guana Cay at Your Doorstep',
    description:
      'Located in Great Guana Cay, this waterfront cottage is perfectly positioned for beach days, island dining, and water adventures. Treasure Cay Marina and Marsh Harbour are worth exploring, while Guana Cay Beach and Tilloo National Park offer beautiful natural scenery.',
    cards: [
      {
        title: 'World-Class Beaches',
        description:
          "Pristine white sand and turquoise waters are a short walk away. Great Guana Cay's beaches are consistently ranked among the Bahamas' finest.",
        tag: 'Walking Distance',
        key: 'nearby-beach',
        src: '/12.jpg',
        alt: 'Pristine white sand beach with turquoise water, bright sunny day, no crowds, tropical paradise Bahamas',
      },
      {
        title: 'Renowned Restaurants',
        description:
          'Nippers Beach Bar & Grill and other celebrated dining destinations are steps away — fresh seafood, tropical cocktails, and island atmosphere.',
        tag: 'Walking Distance',
        key: 'nearby-restaurants',
        src: '/13.jpg',
        alt: 'Beachside restaurant with ocean view, outdoor seating, warm evening light, tropical Caribbean setting',
      },
      {
        title: 'Local Grocery Store',
        description:
          'A convenient grocery store nearby means you can stock your fully-equipped kitchen with fresh local produce and provisions.',
        tag: 'Nearby',
        key: 'nearby-grocery',
        src: '/16.jpg',
        alt: 'Colorful fresh produce and local goods at a small tropical island market, bright natural lighting',
      },
      {
        title: 'Shared Dock & Water Access',
        description:
          'Arrive by boat, launch a kayak, or simply sit at the end of the dock and watch the day unfold over the bay.',
        tag: 'On Property',
        key: 'nearby-dock',
        src: '/17.jpg',
        alt: 'Wooden dock extending over calm turquoise water, clear blue sky, tropical island setting, peaceful morning',
      },
      {
        title: 'Island Life',
        description:
          "Great Guana Cay is one of the Abacos' most cherished out-islands — quiet, authentic, and utterly beautiful.",
        tag: 'The Island',
        key: 'nearby-island',
        src: '/20.jpg',
        alt: 'Aerial view of small tropical island with lush green vegetation surrounded by crystal clear turquoise water',
      },
    ],
    listTitle: 'What\'s nearby',
    listItems: ['Guana Cay Beach — 19 min walk', 'Tilloo National Park — nearby for nature and scenic exploration'],
    mapTitle: 'Great Guana Cay, Abaco',
    mapSubtitle: 'Bahamas · Fisher\'s Bay',
    mapLink: 'https://maps.google.com/?q=Great+Guana+Cay+Bahamas',
    mapImageKey: 'nearby-map',
    mapImageSrc: undefined,
  },
  amenities: {
    eyebrow: 'Amenities',
    title: 'Comfort, design, and island essentials in every room.',
    text: 'A waterfront retreat with thoughtful comforts, easy indoor-outdoor living, and the practical details that make island stays effortless.',
    highlights: [
      {
        title: 'Thoughtful design',
        body: 'Every room blends island warmth with elevated comfort, from waterfront seating to breezy indoor-outdoor flow.',
      },
      {
        title: 'Connected living',
        body: 'Reliable WiFi, Roku TV, and smart speakers keep both work and leisure in easy reach.',
      },
      {
        title: 'Everything you need',
        body: 'A fully equipped kitchen, generous linens, and practical island amenities support relaxed, carefree stays.',
      },
    ],
    categories: [
      {
        title: 'Comfort & Essentials',
        items: [
          'Onsite parking available',
          'Pet-friendly',
          'Air conditioning',
          'Washer',
          'Dryer',
          'Fully equipped kitchen',
          'Refrigerator',
          'Microwave',
          'Stove',
          'Oven',
          'Dishes & utensils',
          'Coffee maker',
          'Kettle',
          'Blender',
          'Toaster',
          'Linens provided',
          'Essentials',
          'Non-smoking',
        ],
      },
      {
        title: 'Entertainment & Connectivity',
        items: ['Wireless internet', 'WiFi', 'Internet access', 'Television', 'Roku TV', 'Stereo'],
      },
      {
        title: 'Outdoor & Property Features',
        items: ['Barbecue grill', 'Garden', 'Parking', 'Waterfront', 'Sea of Abaco', 'Beach', 'Oceanfront', '60 feet of waterfront with a dock', 'Whole house backup generator'],
      },
      {
        title: 'Safety & Peace of Mind',
        items: ['Smoke detector', 'Carbon monoxide detector'],
      },
      {
        title: 'Activities Nearby',
        items: ['Swimming', 'Sailing', 'Water skiing', 'Snorkeling', 'Scuba diving', 'Boating', 'Kayaking', 'Surfing', 'Windsurfing', 'Hiking', 'Cycling', 'Ecotourism', 'Birdwatching', 'Fishing'],
      },
    ],
  },
  rooms: {
    eyebrow: 'Rooms & Spaces',
    title: 'Thoughtful rooms and inviting spaces for relaxed island living.',
    text: 'The villa is designed for comfort, family stays, and easy indoor-outdoor living with a strong focus on water views and waterfront access.',
    bedrooms: [
      {
        title: 'Bedroom 1',
        details: '1 Queen Bed • Quiet, comfortable retreat for two',
      },
      {
        title: 'Bedroom 2',
        details: '1 Queen Bed • Spacious second bedroom for couples or family use',
      },
      {
        title: 'Bedroom 3',
        details: '1 Queen Bed and 1 Twin Bed Bunk • Ideal for kids or extra guests',
      },
      {
        title: 'Bedroom 4',
        details: '1 King Bed with water view • The most scenic suite in the villa',
      },
    ],
    bathrooms: [
      'Bathroom 1 • Toilet • Shower only',
      'Bathroom 2 • Toilet • Shower only',
      'Bathroom 3 • Toilet • Shower only',
      'Bathroom 4 • Toilet • Shower only',
    ],
    spaces: ['Dining area', 'Seating for 6 people', 'Kitchen', 'Lawn/garden', 'Walk to Waterfront', 'Porch/veranda', 'Porch Swing with water view'],
  },
  nearbyAttractions: {
    eyebrow: 'Nearby Attractions',
    title: 'The island is your playground, with beaches and dining just beyond the dock.',
    text: 'Whether you prefer swimming, diving, sightseeing, or a sunset dinner nearby, the location is ideal for both adventure and rest.',
    pills: ['Waterfront', 'Boat Friendly', 'Family Friendly', 'Sunset Views'],
    attractions: [
      { name: 'Guana Cay Beach', description: 'Soft sand and clear water just moments away.' },
      { name: 'Nippers', description: 'A classic island stop for sunsets, cocktails, and live energy.' },
      { name: 'Conch Shack', description: 'Casual Bahamian dining with a laid-back local feel.' },
      { name: 'Treasure Cay Marina', description: 'Perfect for boats, charters, and coastal adventures.' },
    ],
    restaurants: ['Mermaids On The Rocks — 9 min walk', 'Sparky\'s — 2 min drive', 'Kidd\'s Cove Seafood Bar & Grill — 4 min drive', 'Nippers — 4 min drive', 'Atlantic Club — 8 min drive'],
  },
  thingsToDo: {
    eyebrow: 'Things To Do',
    title: 'From reef adventures to quiet afternoons on the porch.',
    text: 'Blue Coral Landing invites you to choose your pace, whether it is active water exploration or peaceful island relaxation.',
    activities: ['Snorkeling', 'Scuba Diving', 'Fishing', 'Boating', 'Island Hopping', 'Beach Walking', 'Swimming', 'Surfing'],
    imageKey: 'villa-activities',
    imageSrc: undefined,
  },
  houseRules: {
    eyebrow: 'House Rules',
    title: 'A polished stay with clear expectations.',
    rules: [
      { label: 'Check-in', value: 'After 3:00 PM' },
      { label: 'Check-out', value: 'Before 10:00 AM' },
      { label: 'Children', value: 'Allowed • Ages 0–17' },
      { label: 'Pets', value: 'Allowed' },
      { label: 'Smoking', value: 'Not permitted' },
      { label: 'Events', value: 'No events allowed' },
    ],
  },
  importantInformation: {
    eyebrow: 'Important information',
    title: 'A few details to help you plan a seamless arrival and a memorable island escape.',
    notes: [
      'Extra-person charges may apply and vary depending on property policy.',
      'Government-issued photo identification and a credit card, debit card, or cash deposit may be required at check-in for incidental charges.',
      'Special requests are subject to availability upon check-in and may incur additional charges; special requests cannot be guaranteed.',
      'Onsite parties or group events are strictly prohibited.',
      'Host has not indicated whether there is a carbon monoxide detector on the property; consider bringing a portable detector.',
      'Host has not indicated whether there is a smoke detector on the property.',
      'This property has outdoor spaces, such as balconies, patios, and terraces, which may not be suitable for children; contact the property prior to arrival if you have concerns.',
    ],
  },
  neighborhood: {
    eyebrow: 'About the neighborhood',
    title: 'Great Guana Cay, Abaco, Bahamas',
    text: 'Set on the Sea of Abaco, the cottage offers easy boat access, a short walk to the Atlantic, and a peaceful island setting that feels wonderfully removed.',
    mapLink: 'https://maps.app.goo.gl/sqZFRcTkxm8AAKyx8',
    highlights: [
      '3-minute walk to the Atlantic beach',
      'Private dock, secure parking, and easy island access',
    ],
  },
  faq: {
    eyebrow: 'Frequently Asked Questions',
    title: 'Everything you need to know before you arrive.',
    text: 'We want your stay to feel effortless, so these are the most common questions guests ask before booking.',
    items: [
      {
        question: 'How many guests can the cottage accommodate?',
        answer: 'Blue Coral Landing sleeps up to 8 guests across four bedrooms and four full bathrooms.',
      },
      {
        question: 'Is the dock suitable for boats?',
        answer: 'Yes, guests can dock their own boat and enjoy direct waterfront access to the Sea of Abaco.',
      },
      {
        question: 'Is the property family-friendly?',
        answer: 'Absolutely. The home welcomes children and families while maintaining a peaceful luxury atmosphere.',
      },
      {
        question: 'How close is the property to the beach?',
        answer: 'The Atlantic beach is only a short 3-minute walk away.',
      },
    ],
  },
  guestReviews: {
    eyebrow: 'Guest Reviews',
    title: 'Trusted by travelers seeking a more refined island stay.',
    text: 'Guests return for the effortless rhythm of the property, the comfort of the interiors, and the views that seem to change with every hour.',
    reviews: [
      {
        quote: 'The home felt like a private sanctuary — the sunset views were unreal and the dock made every day effortless.',
        author: 'Alicia & Marcus',
      },
      {
        quote: 'Beautifully designed, comfortable, and perfectly placed for beach days, boat rides, and family time.',
        author: 'The Larsen Family',
      },
      {
        quote: 'We loved the balance of luxury and authenticity. It was the ideal island escape.',
        author: 'Nadia P.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Reserve your ideal window in paradise.',
    text: 'Use the form below to request dates, guest details, and any special stay preferences. We will follow up with availability and next steps.',
    email: 'hello@bluecorallanding.com',
    phone: '+1 (242) 555-0123',
    note: 'We typically respond within 24 hours. For urgent requests, please contact the number above.',
  },
  footer: {
    socialLinks: [
      { platform: 'Instagram', url: 'https://instagram.com' },
      { platform: 'Facebook', url: 'https://facebook.com' },
      { platform: 'Twitter', url: 'https://twitter.com' },
    ],
  },
};
