"use client";

import React, { useState, useEffect } from 'react';
import styles from './UserStatistics.module.scss';

// Types
interface StatisticItem {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface UserStatisticsProps {
  className?: string;
}

// Simulated API call - replace this with real API later
const fetchStatistics = async (): Promise<StatisticItem[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data matching the screenshot
  return [
    {
      id: 'users',
      label: 'USERS',
      value: 2453,
      icon: '/media/icons/fancy/all_users.svg',
      color: '#DF18FF'
    },
    {
      id: 'active_users',
      label: 'ACTIVE USERS',
      value: 2453,
      icon: '/media/icons/fancy/active_users.svg',
      color: '#5718FF'
    },
    {
      id: 'users_with_loans',
      label: 'USERS WITH LOANS',
      value: 12453,
      icon: '/media/icons/fancy/users_with_loan.svg',
      color: '#F55F44'
    },
    {
      id: 'users_with_savings',
      label: 'USERS WITH SAVINGS',
      value: 102453,
      icon: '/media/icons/fancy/users_with_savings.svg',
      color: '#FF3366'
    }
  ];
};

const UserStatistics: React.FC<UserStatisticsProps> = ({ className = '' }) => {
  const [statistics, setStatistics] = useState<StatisticItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStatistics();
        setStatistics(data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error('Statistics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonLabel} />
              <div className={styles.skeletonValue} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.grid}>
        {statistics.map((stat) => (
          <div key={stat.id} className={styles.card}>
            <div 
              className={styles.iconWrapper}
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <img 
                src={stat.icon} 
                alt=""
                className={styles.icon}
                style={{ color: stat.color }}
              />
            </div>
            
            <span className={styles.label}>{stat.label}</span>
            <span className={styles.value}>{formatNumber(stat.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStatistics;