
import { useQuery } from '@tanstack/react-query';
import {
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { dashboardService } from '@/services/dashboardService';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, href }: StatCardProps) {
  const cardContent = (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            {change && (
              <div
                className={`ml-2 flex items-baseline text-sm font-semibold ${changeType === 'positive'
                    ? 'text-green-600'
                    : changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
              >
                {change}
              </div>
            )}
          </dd>
        </dl>
      </div>
    </div>
  );

  if (href) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <a href={href} className="block p-6">
          {cardContent}
        </a>
      </Card>
    );
  }

  return <Card className="p-6">{cardContent}</Card>;
}

interface RecentActivityProps {
  activities: Array<{
    id: string;
    action: string;
    table: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    timestamp: string;
  }>;
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Activitat recent</h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                      <UsersIcon className="h-5 w-5 text-primary-600" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">
                          {activity.user.firstName} {activity.user.lastName}
                        </span>{' '}
                        ha {activity.action.toLowerCase()} un {activity.table}
                      </p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={activity.timestamp}>
                        {new Date(activity.timestamp).toLocaleDateString('ca-ES')}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardService.getRecentActivity,
  });

  const statCards = [
    {
      title: 'Centres',
      value: stats?.centres || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: BuildingOfficeIcon,
      href: '/centres',
    },
    {
      title: 'Cursos',
      value: stats?.cursos || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: AcademicCapIcon,
      href: '/cursos',
    },
    {
      title: 'Usuaris',
      value: stats?.usuaris || 0,
      change: '+15%',
      changeType: 'positive' as const,
      icon: UsersIcon,
      href: '/usuaris',
    },
    {
      title: 'Assignatures',
      value: stats?.assignatures || 0,
      change: '+5%',
      changeType: 'positive' as const,
      icon: BookOpenIcon,
      href: '/assignatures',
    },
    {
      title: 'Avaluacions',
      value: stats?.avaluacions || 0,
      change: '+23%',
      changeType: 'positive' as const,
      icon: DocumentTextIcon,
      href: '/avaluacions',
    },
    {
      title: 'Integracions',
      value: stats?.integracions || 0,
      change: '0%',
      changeType: 'neutral' as const,
      icon: CogIcon,
      href: '/integracions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Benvingut de nou, {user?.firstName}! Aquí tens una visió general del sistema.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <BellIcon className="h-4 w-4 mr-2" />
            Notificacions
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart placeholder */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Avaluacions per mes</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Gràfic d'avaluacions</p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        {activityLoading ? (
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <RecentActivity activities={recentActivity || []} />
        )}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Accions ràpides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <BuildingOfficeIcon className="h-6 w-6 mb-2" />
            <span>Nou Centre</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <AcademicCapIcon className="h-6 w-6 mb-2" />
            <span>Nou Curs</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <UsersIcon className="h-6 w-6 mb-2" />
            <span>Nou Usuari</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <DocumentTextIcon className="h-6 w-6 mb-2" />
            <span>Nova Avaluació</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
