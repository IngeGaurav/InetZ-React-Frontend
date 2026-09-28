import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/constants/queryKeys';
import { api } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';
import { formatNumber } from '@/utils/formatUtils';
import styles from './DashboardPage.module.css';

const useDashboardStats = () =>
  useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => api.get(endpoints.dashboard.stats),
    staleTime: 2 * 60 * 1000, // 2 min — dashboard data can be slightly stale
  });

const StatCard = ({ title, value, change, icon: Icon, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={styles.iconWrapper}>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={styles.statValue}>{value}</div>
        {change !== undefined && (
          <p className={styles.statChange}>
            <Badge variant={change >= 0 ? 'success' : 'destructive'} className="text-xs">
              {change >= 0 ? '+' : ''}
              {change}%
            </Badge>
            <span className="ml-1 text-xs text-muted-foreground">from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats?.totalUsers ?? 0),
      change: stats?.userGrowth,
      icon: Users,
    },
    {
      title: 'Revenue',
      value: `$${formatNumber(stats?.revenue ?? 0)}`,
      change: stats?.revenueGrowth,
      icon: DollarSign,
    },
    {
      title: 'Active Sessions',
      value: formatNumber(stats?.activeSessions ?? 0),
      change: stats?.sessionGrowth,
      icon: Activity,
    },
    {
      title: 'Growth Rate',
      value: `${stats?.growthRate ?? 0}%`,
      change: stats?.growthRateChange,
      icon: TrendingUp,
    },
  ];

  return (
    <>
      <PageTitle title="Dashboard" />
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>
              Welcome back, {user?.name}. Here's what's happening.
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} isLoading={isLoading} />
          ))}
        </div>

        <div className={styles.contentGrid}>
          <Card className={styles.mainCard}>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 7 days of activity across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connect your activity data source to display events here.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Shortcuts will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
