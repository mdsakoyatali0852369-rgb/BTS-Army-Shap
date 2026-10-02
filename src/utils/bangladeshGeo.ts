export interface DivisionDistricts {
  division: string;
  districts: string[];
}

export const BANGLADESH_DIVISIONS: DivisionDistricts[] = [
  {
    division: 'Dhaka',
    districts: [
      'Dhaka',
      'Gazipur',
      'Narayanganj',
      'Tangail',
      'Faridpur',
      'Manikganj',
      'Munshiganj',
      'Narsingdi',
      'Gopalganj',
      'Madaripur',
      'Rajbari',
      'Shariatpur',
      'Kishoreganj',
    ],
  },
  {
    division: 'Rangpur',
    districts: [
      'Rangpur',
      'Dinajpur',
      'Gaibandha',
      'Kurigram',
      'Lalmonirhat',
      'Nilphamari',
      'Panchagarh',
      'Thakurgaon',
    ],
  },
  {
    division: 'Chittagong',
    districts: [
      'Chittagong',
      'Cox\'s Bazar',
      'Comilla',
      'Feni',
      'Brahmanbaria',
      'Chandpur',
      'Noakhali',
      'Lakshmipur',
      'Khagrachhari',
      'Rangamati',
      'Bandarban',
    ],
  },
  {
    division: 'Rajshahi',
    districts: [
      'Rajshahi',
      'Bogra',
      'Pabna',
      'Sirajganj',
      'Naogaon',
      'Natore',
      'Joypurhat',
      'Chapai Nawabganj',
    ],
  },
  {
    division: 'Khulna',
    districts: [
      'Khulna',
      'Jessore',
      'Satkhira',
      'Jhenaidah',
      'Kushtia',
      'Magura',
      'Bagerhat',
      'Chuadanga',
      'Meherpur',
      'Narail',
    ],
  },
  {
    division: 'Sylhet',
    districts: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  },
  {
    division: 'Barishal',
    districts: ['Barishal', 'Patuakhali', 'Bhola', 'Pirojpur', 'Barguna', 'Jhalokati'],
  },
  {
    division: 'Mymensingh',
    districts: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
  },
];
