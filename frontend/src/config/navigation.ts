import {
  HomeIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  UsersIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  badge?: string;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Centres',
    href: '/dashboard/centres',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Cursos',
    href: '/dashboard/cursos',
    icon: AcademicCapIcon,
  },
  {
    name: 'Usuaris',
    href: '/dashboard/usuaris',
    icon: UsersIcon,
  },
  {
    name: 'Assignatures',
    href: '/dashboard/assignatures',
    icon: BookOpenIcon,
  },
  {
    name: 'Avaluacions',
    href: '/dashboard/avaluacions',
    icon: DocumentTextIcon,
  },
  {
    name: 'Integracions',
    href: '/dashboard/integracions',
    icon: CogIcon,
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    name: 'Notificacions',
    href: '/dashboard/notificacions',
    icon: BellIcon,
    badge: '3',
  },
  {
    name: 'Logs',
    href: '/dashboard/logs',
    icon: ChartBarIcon,
  },
  {
    name: 'Configuració',
    href: '/dashboard/configuracions',
    icon: ShieldCheckIcon,
  },
];
