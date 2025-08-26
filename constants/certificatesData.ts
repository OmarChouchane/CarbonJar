import { GraduationCap, Leaf, Building } from 'lucide-react';

export const COURSE_RECOMMENDATIONS = [
  {
    id: 'advanced-carbon-management',
    title: 'Advanced Carbon Management',
    description:
      'Take your carbon management skills to the next level with advanced strategies and best practices for corporate sustainability.',
    icon: GraduationCap,
    href: '/trainings/advanced-carbon-management',
    duration: '6-8 weeks',
    level: 'Advanced',
    enrolled: 892,
    tags: ['Leadership', 'Strategy', 'Analytics'],
  },
  {
    id: 'green-energy-transition',
    title: 'Green Energy Transition',
    description:
      'Learn about renewable energy systems, sustainable transitions, and implementation strategies for clean energy solutions.',
    icon: Leaf,
    href: '/trainings/green-energy-transition',
    duration: '4-6 weeks',
    level: 'Intermediate',
    enrolled: 1547,
    tags: ['Innovation', 'Technology', 'Implementation'],
  },
  {
    id: 'esg-reporting',
    title: 'ESG Reporting',
    description:
      'Master Environmental, Social, and Governance reporting standards with hands-on practice and real-world case studies.',
    icon: Building,
    href: '/trainings/esg-reporting',
    duration: '5-7 weeks',
    level: 'Professional',
    enrolled: 1203,
    tags: ['Compliance', 'Reporting', 'Governance'],
  },
];

export const QUICK_ACTIONS = [
  {
    id: 'browse-courses',
    title: 'Browse Courses',
    description: 'Discover new training programs',
    href: '/trainings',
  },
  {
    id: 'download-certificates',
    title: 'Download All Certificates',
    description: 'Get PDF copies of all certificates',
  },
  {
    id: 'share-portfolio',
    title: 'Share Portfolio',
    description: 'Share your achievements online',
  },
];
