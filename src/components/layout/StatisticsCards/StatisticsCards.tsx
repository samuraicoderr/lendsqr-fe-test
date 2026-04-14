"use client";

import React, { useState, useEffect, useRef } from 'react';
import { IconType } from 'react-icons';
import {
	FaRegBell,
	FaRegChartBar,
	FaRegCheckCircle,
	FaRegClock,
	FaRegCreditCard,
	FaRegFileAlt,
	FaRegHandshake,
	FaRegListAlt,
	FaRegMoneyBillAlt,
	FaRegUser,
	FaRegUserCircle,
} from 'react-icons/fa';
import styles from './StatisticsCards.module.scss';

export interface StatisticItem {
	id: string;
	label: string;
	value: number;
	icon: string;
	color: string;
}

interface StatisticsCardsProps {
	fetchStats: () => Promise<StatisticItem[]>;
	className?: string;
}

const DEFAULT_ICON = FaRegChartBar;

const colorToRgba = (hex: string, alpha: number): string => {
	const value = hex.replace('#', '');
	if (value.length !== 6) {
		return `rgba(84, 95, 125, ${alpha})`;
	}

	const red = parseInt(value.slice(0, 2), 16);
	const green = parseInt(value.slice(2, 4), 16);
	const blue = parseInt(value.slice(4, 6), 16);
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const isFancyIcon = (iconPath: string) => iconPath.includes('/media/icons/fancy/');

const pickFontAwesomeIcon = (stat: StatisticItem): IconType => {
	const haystack = `${stat.id} ${stat.label} ${stat.icon}`.toLowerCase();

	if (haystack.includes('user') || haystack.includes('guarantor') || haystack.includes('whitelist')) return FaRegUserCircle;
	if (haystack.includes('active') || haystack.includes('approved') || haystack.includes('completed') || haystack.includes('clean')) return FaRegCheckCircle;
	if (haystack.includes('loan') || haystack.includes('request')) return FaRegHandshake;
	if (haystack.includes('saving') || haystack.includes('account')) return FaRegCreditCard;
	if (haystack.includes('transaction') || haystack.includes('volume') || haystack.includes('fee') || haystack.includes('pricing')) return FaRegMoneyBillAlt;
	if (haystack.includes('service') || haystack.includes('system')) return FaRegListAlt;
	if (haystack.includes('report') || haystack.includes('audit')) return FaRegFileAlt;
	if (haystack.includes('pending') || haystack.includes('scheduled') || haystack.includes('expiring')) return FaRegClock;
	if (haystack.includes('alert') || haystack.includes('message') || haystack.includes('bell')) return FaRegBell;
	if (haystack.includes('organization') || haystack.includes('karma')) return FaRegUser;

	return DEFAULT_ICON;
};

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ fetchStats, className = '' }) => {
	const [statistics, setStatistics] = useState<StatisticItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const fetchStatsRef = useRef(fetchStats);
	fetchStatsRef.current = fetchStats;

	useEffect(() => {
		let cancelled = false;

		const loadData = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await fetchStatsRef.current();
				if (!cancelled) {
					setStatistics(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError('Failed to load statistics');
					console.error('Statistics fetch error:', err);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		loadData();
		return () => {
			cancelled = true;
		};
	}, []);

	const formatNumber = (num: number): string => num.toLocaleString('en-US');

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
				{statistics.map((stat) => {
					const IconComponent = pickFontAwesomeIcon(stat);
					const keepFancyIcon = isFancyIcon(stat.icon);

					return (
						<div key={stat.id} className={styles.card}>
							<div className={styles.iconWrapper} style={{ backgroundColor: colorToRgba(stat.color, 0.14) }}>
								{keepFancyIcon ? (
									<img src={stat.icon} alt="" className={styles.iconFancy} />
								) : (
									<IconComponent className={styles.iconFont} style={{ color: stat.color }} aria-hidden="true" />
								)}
							</div>
						<span className={styles.label}>{stat.label}</span>
						<span className={styles.value}>{formatNumber(stat.value)}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default StatisticsCards;
