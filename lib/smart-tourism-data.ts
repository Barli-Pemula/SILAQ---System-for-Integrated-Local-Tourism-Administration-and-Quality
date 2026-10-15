import { Destination, TourismEvent, Partner, Transaction, CarbonOffsetProject } from '@/types/smart-tourism'

const maps = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'dest-gili',
    name: 'Gili Trawangan',
    category: 'Gili',
    location: 'Lombok Utara',
    region: 'Lombok Utara',
    address: 'Gili Trawangan, Gili Indah, Kec. Pemenang, Kab. Lombok Utara, NTB',
    mapsUrl: maps('Gili Trawangan, Lombok Utara, Nusa Tenggara Barat'),
    price: 150000,
    originalPrice: 200000,
    discount: '25% OFF',
    rating: 4.9,
    reviewsCount: 1420,
    image: 'https://images.unsplash.com/photo-1530711338425-2d21c46b32a5?w=900&h=700&fit=crop&auto=format',
    description: 'Pulau tropis bebas kendaraan bermotor dengan terumbu karang memukau, penyu laut liar, dan suasana matahari terbenam paling ikonik di Indonesia.',
    highlights: ['Bebas polusi kendaraan', 'Spot snorkeling penyu', 'Sunset view Gunung Agung', 'Sewa sepeda keliling pulau'],
    isPopular: true,
    ticketTiers: [
      { id: 'tier-reg', name: 'Reguler Boat Pass', price: 150000, description: 'Tiket kapal penyeberangan reguler PP', quotaPerDay: 500, quotaRemaining: 184 },
      { id: 'tier-vip', name: 'VIP Fast Boat + Snorkeling', price: 250000, description: 'Speedboat express + sewa gear snorkeling & pemandu', quotaPerDay: 200, quotaRemaining: 42, badge: 'Paling Populer' },
      { id: 'tier-wknd', name: 'Weekend Sunset Pass', price: 180000, description: 'Tiket akhir pekan + kupon kelapa muda pantai barat', quotaPerDay: 300, quotaRemaining: 95 }
    ]
  },
  {
    id: 'dest-rinjani',
    name: 'Taman Nasional Gunung Rinjani',
    category: 'Gunung',
    location: 'Sembalun, Lombok Timur',
    region: 'Lombok Timur',
    address: 'Pintu Gerbang TNGR Jalur Sembalun, Desa Sembalun Lawang, Kec. Sembalun, Kab. Lombok Timur, NTB',
    mapsUrl: maps('Gerbang TNGR Sembalun, Lombok Timur, Nusa Tenggara Barat'),
    price: 175000,
    rating: 4.8,
    reviewsCount: 890,
    image: 'https://images.unsplash.com/photo-1714645219293-106a5bb6d289?w=900&h=700&fit=crop&auto=format',
    description: 'Gunung berapi tertinggi kedua di Indonesia dengan Danau Segara Anak yang mistis dan pemandangan kawah spektakuler di atas awan.',
    highlights: ['Pendakian jalur Sembalun & Senaru', 'Danau Segara Anak', 'Sumber air panas alami', 'Sunrise di Puncak 3726 mdpl'],
    isPopular: true,
    ticketTiers: [
      { id: 'rinjani-reg', name: 'Simaksi WNI 2H1M', price: 175000, description: 'Surat izin masuk kawasan konservasi', quotaPerDay: 250, quotaRemaining: 68 },
      { id: 'rinjani-vip', name: 'Porter & Guide Certified Pass', price: 450000, description: 'Termasuk sertifikat pendakian & asuransi SAR', quotaPerDay: 100, quotaRemaining: 19, badge: 'Eco-Certified' }
    ]
  },
  {
    id: 'dest-mandalika',
    name: 'Pantai Kuta Mandalika',
    category: 'Pantai',
    location: 'Pujut, Lombok Tengah',
    region: 'Lombok Tengah',
    address: 'Jl. Kuta Mandalika, Kuta, Kec. Pujut, Kab. Lombok Tengah, NTB',
    mapsUrl: maps('Pantai Kuta Mandalika, Lombok Tengah, Nusa Tenggara Barat'),
    price: 50000,
    rating: 4.7,
    reviewsCount: 1105,
    image: 'https://images.unsplash.com/photo-1660020214290-800d5775a867?w=900&h=700&fit=crop&auto=format',
    description: 'Hamparan pasir putih unik berbentuk buliran merica berpadu dengan sirkuit balap internasional Mandalika dan deburan ombak berselancar.',
    highlights: ['Pasir butiran merica khas', 'Dekat Sirkuit Mandalika', 'Pusat kuliner Sasak pesisir', 'Spot sunset Bukit Merese'],
    isPopular: true,
    ticketTiers: [
      { id: 'mandalika-reg', name: 'Tiket Masuk Kawasan', price: 50000, description: 'Akses pantai & fasilitas umum', quotaPerDay: 1200, quotaRemaining: 640 },
      { id: 'mandalika-vip', name: 'All-Day Beach Club & Merese Pass', price: 120000, description: 'Akses gazebo khusus + shuttle bukit Merese', quotaPerDay: 300, quotaRemaining: 88 }
    ]
  },
  {
    id: 'dest-sade',
    name: 'Desa Adat Sade',
    category: 'Budaya',
    location: 'Rambitan, Lombok Tengah',
    region: 'Lombok Tengah',
    address: 'Dsn. Sade, Desa Rambitan, Kec. Pujut, Kab. Lombok Tengah, NTB',
    mapsUrl: maps('Desa Adat Sade, Rambitan, Lombok Tengah, Nusa Tenggara Barat'),
    price: 35000,
    rating: 4.9,
    reviewsCount: 780,
    image: 'https://images.unsplash.com/photo-1746964246729-3bcad599e959?w=900&h=700&fit=crop&auto=format',
    description: 'Desa warisan suku Sasak asli dengan arsitektur rumah tradisional berbahan bambu & ijuk serta tradisi menenun kain songket legendaris.',
    highlights: ['Wisata budaya Sasak otentik', 'Workshop tenun kain songket', 'Arsitektur Bale Tani', 'Tarian adat Gendang Beleq'],
    ticketTiers: [
      { id: 'sade-reg', name: 'Tiket Masuk & Edukasi Adat', price: 35000, description: 'Dipandu oleh pemandu lokal warga desa', quotaPerDay: 400, quotaRemaining: 155 },
      { id: 'sade-vip', name: 'Paket Belajar Tenun + Suvenir', price: 95000, description: 'Kelas interaktif tenun 45 menit + selendang tenun', quotaPerDay: 80, quotaRemaining: 24, badge: 'Budaya Asli' }
    ]
  },
  {
    id: 'dest-sendanggile',
    name: 'Air Terjun Sendang Gile & Tiu Kelep',
    category: 'Air Terjun',
    location: 'Senaru, Lombok Utara',
    region: 'Lombok Utara',
    address: 'Dsn. Senaru, Desa Senaru, Kec. Bayan, Kab. Lombok Utara, NTB',
    mapsUrl: maps('Air Terjun Sendang Gile Tiu Kelep, Senaru, Lombok Utara, Nusa Tenggara Barat'),
    price: 40000,
    rating: 4.8,
    reviewsCount: 650,
    image: 'https://images.unsplash.com/photo-1685975875980-f19fbd4d36a6?w=900&h=700&fit=crop&auto=format',
    description: 'Air terjun ganda nan sejuk di kaki Gunung Rinjani dengan kolam alami yang konon membuat awet muda menurut cerita rakyat Sasak.',
    highlights: ['Trekking hutan tropis rimbun', 'Kolam kesegaran alami', 'Pemandangan tebing vulkanik', 'Spot foto pelangi air terjun'],
    ticketTiers: [
      { id: 'tiu-reg', name: 'Tiket Masuk Kawasan Wisata', price: 40000, description: 'Akses dua air terjun Sendang Gile & Tiu Kelep', quotaPerDay: 600, quotaRemaining: 240 }
    ]
  },

  {
    id: 'dest-giliair',
    name: 'Gili Air',
    category: 'Gili',
    location: 'Lombok Utara',
    region: 'Lombok Utara',
    address: 'Jl. Gili Air, Gili Indah, Kec. Pemenang, Kab. Lombok Utara, NTB',
    mapsUrl: maps('Gili Air, Lombok Utara, Nusa Tenggara Barat'),
    price: 100000,
    rating: 4.8,
    reviewsCount: 940,
    image: 'https://images.unsplash.com/photo-1530711338425-2d21c46b32a5?w=900&h=700&fit=crop&auto=format',
    description: 'Gili paling dekat dengan daratan Lombok, memadukan suasana hidup yang santai, beach club pinggir pantai, dan titik snorkeling air jernih tanpa arus keras.',
    highlights: ['Penyeberangan cepat 15 menit', 'Snorkeling titik batu coral', 'Sunset bar tepi pantai', 'Sewa sepeda keliling pulau'],
    isPopular: true,
    ticketTiers: [
      { id: 'giliair-reg', name: 'Boat Pass PP Bangsal', price: 100000, description: 'Tiket kapal tradisional PP Bangsal - Gili Air', quotaPerDay: 450, quotaRemaining: 176 },
      { id: 'giliair-snorkel', name: 'Island Hopping Snorkel Pass', price: 190000, description: 'Tur 3 gili + alat snorkel + pemandu laut', quotaPerDay: 120, quotaRemaining: 38, badge: 'Favorit Wisatawan' }
    ]
  },
  {
    id: 'dest-gilimeno',
    name: 'Gili Meno',
    category: 'Gili',
    location: 'Lombok Utara',
    region: 'Lombok Utara',
    address: 'Gili Meno, Gili Indah, Kec. Pemenang, Kab. Lombok Utara, NTB',
    mapsUrl: maps('Gili Meno, Lombok Utara, Nusa Tenggara Barat'),
    price: 100000,
    rating: 4.7,
    reviewsCount: 610,
    image: 'https://images.unsplash.com/photo-1530711338425-2d21c46b32a5?w=900&h=700&fit=crop&auto=format',
    description: 'Gili paling tenang dengan laguna dangkal, penyu laut yang jinak, dan hamparan pasir putih lepas tanpa keramaian.',
    highlights: ['Turtle point snorkeling', 'Laguna dangkal aman anak', 'Pulau bebas kendaraan bermotor', 'Taman burung & kebun kelapa'],
    ticketTiers: [
      { id: 'gilimeno-reg', name: 'Boat Pass PP Bangsal', price: 100000, description: 'Tiket kapal tradisional PP Bangsal - Gili Meno', quotaPerDay: 350, quotaRemaining: 142 }
    ]
  },
  {
    id: 'dest-gilinanggu',
    name: 'Gili Nanggu',
    category: 'Gili',
    location: 'Lombok Barat',
    region: 'Lombok Barat',
    address: 'Gili Nanggu, Dsn. Gili Nanggu, Desa Sekotong Barat, Kec. Sekotong, Kab. Lombok Barat, NTB',
    mapsUrl: maps('Gili Nanggu, Sekotong, Lombok Barat, Nusa Tenggara Barat'),
    price: 150000,
    rating: 4.7,
    reviewsCount: 430,
    image: 'https://images.unsplash.com/photo-1530711338425-2d21c46b32a5?w=900&h=700&fit=crop&auto=format',
    description: 'Permata tersembunyi di gugusan Sekotong dengan pasir berbintang putih, karang dangkal, dan homestay pinggir pantai yang tenang.',
    highlights: ['Titik snorkeling karang dangkal', 'Pantai pasir berbintang', 'Homestay warga pinggir pantai', 'Konservasi penyu lokal'],
    ticketTiers: [
      { id: 'nanggu-reg', name: 'Paket Trip Sekotong', price: 150000, description: 'Speedboat PP + tiket masuk pulau', quotaPerDay: 200, quotaRemaining: 87 },
      { id: 'nanggu-full', name: 'Full Day Island Package', price: 275000, description: 'Trip 3 gili + makan siang + alat snorkel', quotaPerDay: 80, quotaRemaining: 21, badge: 'Paket Hemat' }
    ]
  },
  {
    id: 'dest-tanjungaan',
    name: 'Pantai Tanjung Aan',
    category: 'Pantai',
    location: 'Pujut, Lombok Tengah',
    region: 'Lombok Tengah',
    address: 'Jl. Tanjung Aan, Desa Mertak, Kec. Pujut, Kab. Lombok Tengah, NTB',
    mapsUrl: maps('Pantai Tanjung Aan, Lombok Tengah, Nusa Tenggara Barat'),
    price: 20000,
    rating: 4.8,
    reviewsCount: 980,
    image: 'https://images.unsplash.com/photo-1660020214290-800d5775a867?w=900&h=700&fit=crop&auto=format',
    description: 'Dua teluk pasir putih dengan air sebening kaca, favorit untuk berenang, piknik keluarga, dan pendakian singkat ke Bukit Merese.',
    highlights: ['Air jernih dangkal untuk berenang', 'Pendakian singkat Bukit Merese', 'Warung ikan bakar tepi pantai', 'Venue upacara Bau Nyale'],
    isPopular: true,
    ticketTiers: [
      { id: 'aan-reg', name: 'Tiket Masuk Kawasan', price: 20000, description: 'Akses pantai & area parkir resmi', quotaPerDay: 1500, quotaRemaining: 720 },
      { id: 'aan-merese', name: 'Merese Sunset Guide Pass', price: 75000, description: 'Pemandu + pickup Bukit Merese sore hari', quotaPerDay: 100, quotaRemaining: 34, badge: 'Sunset Terbaik' }
    ]
  },
  {
    id: 'dest-senggigi',
    name: 'Pantai Senggigi',
    category: 'Pantai',
    location: 'Lombok Barat',
    region: 'Lombok Barat',
    address: 'Jl. Raya Senggigi, Batulayar, Kec. Batulayar, Kab. Lombok Barat, NTB',
    mapsUrl: maps('Pantai Senggigi, Lombok Barat, Nusa Tenggara Barat'),
    price: 10000,
    rating: 4.6,
    reviewsCount: 1240,
    image: 'https://images.unsplash.com/photo-1660020214290-800d5775a867?w=900&h=700&fit=crop&auto=format',
    description: 'Pantai legendaris Lombok Barat dengan jalan pesisir, tebing batu karang, dan panorama matahari terbenam menghadap Gunung Agung Bali.',
    highlights: ['Sunset menghadap Bali', 'Pantai berenang keluarga', 'Jalur pesisir Senggigi', 'Dekat pusat hotel & kuliner'],
    ticketTiers: [
      { id: 'senggigi-reg', name: 'Tiket Masuk Pesisir', price: 10000, description: 'Akses pantai & jalur pesisir Senggigi', quotaPerDay: 900, quotaRemaining: 415 }
    ]
  },
  {
    id: 'dest-batupayung',
    name: 'Pantai Batu Payung',
    category: 'Pantai',
    location: 'Pujut, Lombok Tengah',
    region: 'Lombok Tengah',
    address: 'Jl. Pantai Kuta - Batu Payung, Dsn. Tampak, Desa Mertak, Kec. Pujut, Kab. Lombok Tengah, NTB',
    mapsUrl: maps('Pantai Batu Payung, Lombok Tengah, Nusa Tenggara Barat'),
    price: 15000,
    rating: 4.5,
    reviewsCount: 360,
    image: 'https://images.unsplash.com/photo-1660020214290-800d5775a867?w=900&h=700&fit=crop&auto=format',
    description: 'Pantai kecil dengan formasi batu raksasa berbentuk payung alami, spot foto ikonik di ujung jalur pesisir selatan.',
    highlights: ['Formasi batu payung ikonik', 'Jalur ATV pesisir selatan', 'Ombak kecil ramah anak', 'Spot foto sunrise'],
    ticketTiers: [
      { id: 'payung-reg', name: 'Tiket Masuk & Parkir', price: 15000, description: 'Akses jalur pantai + parkir kendaraan', quotaPerDay: 500, quotaRemaining: 230 }
    ]
  },
  {
    id: 'dest-pinkbeach',
    name: 'Pantai Pink (Tangsi)',
    category: 'Pantai',
    location: 'Jerowaru, Lombok Timur',
    region: 'Lombok Timur',
    address: 'Pantai Tangsi (Pink Beach), Dsn. Belong, Desa Pemecongong, Kec. Jerowaru, Kab. Lombok Timur, NTB',
    mapsUrl: maps('Pantai Pink Tangsi, Jerowaru, Lombok Timur, Nusa Tenggara Barat'),
    price: 25000,
    rating: 4.7,
    reviewsCount: 300,
    image: 'https://images.unsplash.com/photo-1530711338425-2d21c46b32a5?w=900&h=700&fit=crop&auto=format',
    description: 'Pantai dengan pasir merah muda khas pecahan karang, tersembunyi di ujung timur Lombok dengan air laut bergradasi tiga warna.',
    highlights: ['Pasir merah muda langka', 'Snorkeling karang sehat', 'Tur perahu menuju Gili Petelu', 'Pemandangan pulau Sumbawa'],
    ticketTiers: [
      { id: 'pink-reg', name: 'Tiket Masuk Pantai', price: 25000, description: 'Akses pantai + kontribusi konservasi', quotaPerDay: 300, quotaRemaining: 118 },
      { id: 'pink-boat', name: 'Perahu Ponton Snorkel', price: 175000, description: 'Sewa perahu lokal + alat snorkel 2 titik', quotaPerDay: 60, quotaRemaining: 17, badge: 'Terbatas' }
    ]
  },
  {
    id: 'dest-sukarara',
    name: 'Desa Sukarara',
    category: 'Budaya',
    location: 'Praya Barat, Lombok Tengah',
    region: 'Lombok Tengah',
    address: 'Jl. Raya Praya - Pelaijaran, Desa Sukarara, Kec. Praya Barat, Kab. Lombok Tengah, NTB',
    mapsUrl: maps('Desa Sukarara, Lombok Tengah, Nusa Tenggara Barat'),
    price: 35000,
    rating: 4.8,
    reviewsCount: 520,
    image: 'https://images.unsplash.com/photo-1746964246729-3bcad599e959?w=900&h=700&fit=crop&auto=format',
    description: 'Desa pengrajin tenun Songket Lombok dengan alat tenun tradisional Buku, tempat terbaik memahami sablon dan anyaman warga Sasak.',
    highlights: ['Workshop tenun songket', 'Rumah adat Buku & Bale Lemu', 'Etalase kain suvenir resmi', 'Pemandu perempuan Sasak'],
    ticketTiers: [
      { id: 'sukarara-reg', name: 'Tur Budaya & Edukasi', price: 35000, description: 'Pemandu lokal + demo tenun kain songket', quotaPerDay: 350, quotaRemaining: 140 },
      { id: 'sukarara-weave', name: 'Paket Tenun & Suvenir', price: 95000, description: 'Kelas tenun 45 menit + kain motif pilihan', quotaPerDay: 70, quotaRemaining: 26, badge: 'Kelas Terbatas' }
    ]
  },
  {
    id: 'dest-batubolong',
    name: 'Pura Batu Bolong',
    category: 'Budaya',
    location: 'Pujut, Lombok Tengah',
    region: 'Lombok Tengah',
    address: 'Pura Batu Bolong, Jl. Pantai Tanjung Aan, Desa Mertak, Kec. Pujut, Kab. Lombok Tengah, NTB',
    mapsUrl: maps('Pura Batu Bolong, Lombok Tengah, Nusa Tenggara Barat'),
    price: 20000,
    rating: 4.7,
    reviewsCount: 410,
    image: 'https://images.unsplash.com/photo-1746964246729-3bcad599e959?w=900&h=700&fit=crop&auto=format',
    description: 'Pura Hindu di atas batu karang berlubang dengan pura kecil di tepi tebing, memadukan sejarah Majapahit dan panorama Samudra Hindia.',
    highlights: ['Gerbang candi bersejarah', 'Panorama tebing & ombak', 'Ritual umat Hindu Lombok', 'Sunset dari halaman pura'],
    ticketTiers: [
      { id: 'bolong-reg', name: 'Tiket Masuk Pura', price: 20000, description: 'Akses halaman pura + area tebing', quotaPerDay: 400, quotaRemaining: 195 }
    ]
  },
  {
    id: 'dest-tiupupus',
    name: 'Air Terjun Tiu Pupus',
    category: 'Air Terjun',
    location: 'Bayan, Lombok Utara',
    region: 'Lombok Utara',
    address: 'Dsn. Putri Bala, Desa Senaru, Kec. Bayan, Kab. Lombok Utara, NTB',
    mapsUrl: maps('Air Terjun Tiu Pupus, Senaru, Lombok Utara, Nusa Tenggara Barat'),
    price: 25000,
    rating: 4.6,
    reviewsCount: 280,
    image: 'https://images.unsplash.com/photo-1685975875980-f19fbd4d36a6?w=900&h=700&fit=crop&auto=format',
    description: 'Air terjun bertingkat dengan kolam alami di hutan tropis Senaru, lebih sepi dari Sendang Gile dan favorit warga lokal.',
    highlights: ['Trekking hutan 20 menit', 'Kolam alami segar', 'Jalur sepi & asri', 'Kombinasi trip Senaru'],
    ticketTiers: [
      { id: 'pupus-reg', name: 'Tiket Masuk Air Terjun', price: 25000, description: 'Akses jalur trekking & kolam Tiu Pupus', quotaPerDay: 250, quotaRemaining: 120 }
    ]
  }
]


export const INITIAL_EVENTS: TourismEvent[] = [
  {
    id: 'evt-baunyale',
    title: 'Festival Pesona Bau Nyale 2026',
    date: '24–26 Februari 2026',
    time: '20:00 - 06:00 WITA',
    location: 'Pantai Seger, Kawasan Mandalika',
    category: 'Budaya',
    price: 'Gratis',
    image: 'https://images.unsplash.com/photo-1660020214290-800d5775a867?w=900&h=700&fit=crop&auto=format',
    description: 'Tradisi sakral menangkap cacing laut jelmaan Putri Mandalika dengan karnaval budaya, pemilihan Putri Mandalika, dan pertunjukan wayang Sasak semalam suntuk.',
    schedule: [
      { time: '19:00', activity: 'Karnaval Parade Budaya 1000 Putri Mandalika' },
      { time: '21:00', activity: 'Drama Musikal Legenda Putri Mandalika' },
      { time: '03:30', activity: 'Ritual Turun ke Laut Menangkap Nyale' }
    ]
  },
  {
    id: 'evt-jazz',
    title: 'Senggigi Sunset Jazz Festival',
    date: '15 Maret 2026',
    time: '16:00 - 22:30 WITA',
    location: 'Pantai Senggigi, Lombok Barat',
    category: 'Musik',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1530711338425-2d21c46b32a5?w=900&h=700&fit=crop&auto=format',
    description: 'Festival musik jazz tepi pantai paling eksotis dengan latar belakang siluet matahari terbenam dan hembusan angin laut Selat Lombok.',
    schedule: [
      { time: '16:30', activity: 'Opening Act: Lombok Ethnic Jazz Fusion' },
      { time: '18:15', activity: 'Sunset Instrumental Break' },
      { time: '19:30', activity: 'Headliner Guest Artists Concert' }
    ]
  },
  {
    id: 'evt-marathon',
    title: 'Rinjani Geopark Ultra Marathon',
    date: '12 April 2026',
    time: '05:00 - 15:00 WITA',
    location: 'Sembalun Valley, Lombok Timur',
    category: 'Olahraga',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1714645219293-106a5bb6d289?w=900&h=700&fit=crop&auto=format',
    description: 'Lari lintas alam melintasi bukit savana Sembalun, kebun kopi, dan lembah purba Rinjani berstandar internasional ITRA.',
    schedule: [
      { time: '04:30', activity: 'Briefing & Race Start 50K Ultra' },
      { time: '06:00', activity: 'Race Start 21K Trail' },
      { time: '14:00', activity: 'Medal Ceremony & Sasak Feast' }
    ]
  }
]

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'ptr-01',
    name: 'BlueWater Express Lombok',
    contactPerson: 'Adi Saputra',
    destination: 'Gili Trawangan & Speedboat',
    region: 'Lombok Utara',
    status: 'Online',
    visitorsMonthly: 4820,
    uptimeRate: '99.4%',
    rating: 4.9,
    totalRevenue: 'Rp 648.500.000',
    phone: '+62 812-3456-7890',
    email: 'adi@bluewaterlombok.id',
    joinedDate: 'Jan 2024'
  },
  {
    id: 'ptr-02',
    name: 'Rinjani Eco Trekking Explorer',
    contactPerson: 'Lalu Fikri',
    destination: 'Taman Nasional Gn. Rinjani',
    region: 'Lombok Timur',
    status: 'Online',
    visitorsMonthly: 3640,
    uptimeRate: '98.2%',
    rating: 4.8,
    totalRevenue: 'Rp 580.200.000',
    phone: '+62 813-9876-5432',
    email: 'fikri@rinjaniexplore.id',
    joinedDate: 'Mar 2024'
  },
  {
    id: 'ptr-03',
    name: 'Koperasi Tenun Desa Adat Sade',
    contactPerson: 'Siti Aulia',
    destination: 'Desa Adat Sade',
    region: 'Lombok Tengah',
    status: 'Online',
    visitorsMonthly: 2185,
    uptimeRate: '98.9%',
    rating: 4.9,
    totalRevenue: 'Rp 142.300.000',
    phone: '+62 878-1122-3344',
    email: 'siti@desasade.org',
    joinedDate: 'Feb 2024'
  },
  {
    id: 'ptr-04',
    name: 'Mandalika Tourism Operator',
    contactPerson: 'Maya Lestari',
    destination: 'Pantai Kuta & Merese',
    region: 'Lombok Tengah',
    status: 'Review',
    visitorsMonthly: 5120,
    uptimeRate: '96.5%',
    rating: 4.6,
    totalRevenue: 'Rp 412.000.000',
    phone: '+62 821-4455-6677',
    email: 'ops@mandalikatrip.com',
    joinedDate: 'Agt 2024'
  },
  {
    id: 'ptr-05',
    name: 'Senaru Green Waterfall Eco',
    contactPerson: 'Budi Santoso',
    destination: 'Sendang Gile & Tiu Kelep',
    region: 'Lombok Utara',
    status: 'Pending',
    visitorsMonthly: 1420,
    uptimeRate: '94.0%',
    rating: 4.7,
    totalRevenue: 'Rp 94.000.000',
    phone: '+62 819-7788-9900',
    email: 'budi@senarueco.id',
    joinedDate: 'Jan 2026'
  }
]

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'LT-29481',
    customerName: 'Nadya Putri',
    destination: 'Gili Trawangan',
    partnerName: 'BlueWater Express Lombok',
    ticketType: 'VIP Fast Boat + Snorkeling',
    quantity: 2,
    totalAmount: 500000,
    status: 'Check-in',
    timestamp: '14 Okt 2026, 18:42 WITA',
    paymentMethod: 'QRIS',
    channel: 'Online App',
    qrCode: 'LMBK-GT-9082'
  },
  {
    id: 'LT-29480',
    customerName: 'Marcus Lindqvist',
    destination: 'Taman Nasional Gn. Rinjani',
    partnerName: 'Rinjani Eco Trekking Explorer',
    ticketType: 'Porter & Guide Certified Pass',
    quantity: 2,
    totalAmount: 900000,
    status: 'Berhasil',
    timestamp: '14 Okt 2026, 17:15 WITA',
    paymentMethod: 'BCA Virtual Account',
    channel: 'Online App',
    qrCode: 'LMBK-RJ-4412'
  },
  {
    id: 'LT-29479',
    customerName: 'Rizky Ananda',
    destination: 'Gili Trawangan',
    partnerName: 'BlueWater Express Lombok',
    ticketType: 'Reguler Boat Pass',
    quantity: 4,
    totalAmount: 600000,
    status: 'Check-in',
    timestamp: '14 Okt 2026, 16:30 WITA',
    paymentMethod: 'GoPay',
    channel: 'Online App',
    qrCode: 'LMBK-GT-8819'
  },
  {
    id: 'LT-29478',
    customerName: 'Ahmad Fauzan',
    destination: 'Desa Adat Sade',
    partnerName: 'Koperasi Tenun Desa Adat Sade',
    ticketType: 'Paket Belajar Tenun + Suvenir',
    quantity: 3,
    totalAmount: 285000,
    status: 'Berhasil',
    timestamp: '14 Okt 2026, 15:10 WITA',
    paymentMethod: 'Tunai / Kasir',
    channel: 'Loket Destinasi (POS)',
    qrCode: 'LMBK-SD-1029'
  },
  {
    id: 'LT-29477',
    customerName: 'Sarah Jenkins',
    destination: 'Pantai Kuta Mandalika',
    partnerName: 'Mandalika Tourism Operator',
    ticketType: 'All-Day Beach Club Pass',
    quantity: 2,
    totalAmount: 240000,
    status: 'Diproses',
    timestamp: '14 Okt 2026, 14:05 WITA',
    paymentMethod: 'Kartu Kredit',
    channel: 'Online App',
    qrCode: 'LMBK-MK-7721'
  }
]

export const CARBON_PROJECTS: CarbonOffsetProject[] = [
  {
    id: 'carb-01',
    title: 'Restorasi Hutan Mangrove Gili Air',
    location: 'Pesisir Gili Air, Lombok Utara',
    price: 25000,
    co2OffsetKg: 5.2,
    icon: '🌱',
    description: 'Penanaman bibit Rhizophora mucronata untuk benteng abrasi dan habitat biota terumbu karang.',
    participants: 1240
  },
  {
    id: 'carb-02',
    title: 'Adopsi Pohon Lereng Rinjani Sembalun',
    location: 'Kawasan Penyangga TNGR Sembalun',
    price: 50000,
    co2OffsetKg: 12.0,
    icon: '🌳',
    description: 'Penanaman pohon beringin & pinus untuk mata air masyarakat lembah Rinjani.',
    participants: 820
  },
  {
    id: 'carb-03',
    title: 'Dukungan Desa Sirkular Sampah Adat Sade',
    location: 'Kecamatan Pujut, Lombok Tengah',
    price: 30000,
    co2OffsetKg: 6.8,
    icon: '♻️',
    description: 'Pengelolaan daur ulang limbah pariwisata menjadi pupuk organik kebun warga Sasak.',
    participants: 590
  }
]

export const REGIONS_DATA = [
  { name: 'Lombok Tengah', visitors: '14.850', gmv: 'Rp 1,84 M', growth: '+18.4%', activePartners: 16, status: 'Optimal' },
  { name: 'Lombok Utara', visitors: '12.420', gmv: 'Rp 1,52 M', growth: '+14.2%', activePartners: 14, status: 'Kunjungan Tinggi' },
  { name: 'Lombok Timur', visitors: '8.310', gmv: 'Rp 1,02 M', growth: '+9.1%', activePartners: 11, status: 'Stabil' },
  { name: 'Kota Mataram & Barat', visitors: '6.940', gmv: 'Rp 890 Jt', growth: '+7.5%', activePartners: 7, status: 'Stabil' }
]
