"use client";

import React, { useState, useEffect } from 'react';
import styles from './UserDetails.module.scss';

// Types
interface UserDetailsData {
  id: string;
  fullName: string;
  userId: string;
  tier: number;
  balance: string;
  accountNumber: string;
  bank: string;
  personalInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    bvn: string;
    gender: string;
    maritalStatus: string;
    children: string;
    residenceType: string;
  };
  educationEmployment: {
    level: string;
    employmentStatus: string;
    sector: string;
    duration: string;
    officeEmail: string;
    monthlyIncome: string;
    loanRepayment: string;
  };
  socials: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
  guarantors: Array<{
    fullName: string;
    phoneNumber: string;
    email: string;
    relationship: string;
  }>;
}

interface UserDetailsProps {
  userId?: string;
  onBack?: () => void;
  onBlacklist?: () => void;
  onActivate?: () => void;
  className?: string;
}

// Simulated API - replace with real API call
const fetchUserDetails = async (id: string): Promise<UserDetailsData> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id,
    fullName: 'Grace Effiom',
    userId: 'LSQFf587g90',
    tier: 2,
    balance: '₦200,000.00',
    accountNumber: '9912345678',
    bank: 'Providus Bank',
    personalInfo: {
      fullName: 'Grace Effiom',
      phoneNumber: '07060780922',
      email: 'grace@gmail.com',
      bvn: '07060780922',
      gender: 'Female',
      maritalStatus: 'Single',
      children: 'None',
      residenceType: "Parent's Apartment"
    },
    educationEmployment: {
      level: 'B.Sc',
      employmentStatus: 'Employed',
      sector: 'FinTech',
      duration: '2 years',
      officeEmail: 'grace@lendsqr.com',
      monthlyIncome: '₦200,000.00- ₦400,000.00',
      loanRepayment: '40,000'
    },
    socials: {
      twitter: '@grace_effiom',
      facebook: 'Grace Effiom',
      instagram: '@grace_effiom'
    },
    guarantors: [
      {
        fullName: 'Debby Ogana',
        phoneNumber: '07060780922',
        email: 'debby@gmail.com',
        relationship: 'Sister'
      },
      {
        fullName: 'Debby Ogana',
        phoneNumber: '07060780922',
        email: 'debby@gmail.com',
        relationship: 'Sister'
      }
    ]
  };
};

const UserDetails: React.FC<UserDetailsProps> = ({
  userId = '1',
  onBack,
  onBlacklist,
  onActivate,
  className = ''
}) => {
  const [user, setUser] = useState<UserDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserDetails(userId);
        setUser(data);
      } catch (err) {
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const tabs = [
    { id: 'general', label: 'General Details' },
    { id: 'documents', label: 'Documents' },
    { id: 'bank', label: 'Bank Details' },
    { id: 'loans', label: 'Loans' },
    { id: 'savings', label: 'Savings' },
    { id: 'app', label: 'App and System' }
  ];

  const renderStars = (tier: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <img
        key={i} 
        src={i < tier ? '/media/icons/orange-star-filled.svg' : '/media/icons/orange-star-outlined.svg'}
        alt={i < tier ? 'Filled star' : 'Outlined star'}
        className={i < tier ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  const renderGeneralDetails = (details: UserDetailsData) => (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Personal Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>full Name</span>
            <span className={styles.infoValue}>{details.personalInfo.fullName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Phone Number</span>
            <span className={styles.infoValue}>{details.personalInfo.phoneNumber}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email Address</span>
            <span className={styles.infoValue}>{details.personalInfo.email}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Bvn</span>
            <span className={styles.infoValue}>{details.personalInfo.bvn}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Gender</span>
            <span className={styles.infoValue}>{details.personalInfo.gender}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Marital status</span>
            <span className={styles.infoValue}>{details.personalInfo.maritalStatus}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Children</span>
            <span className={styles.infoValue}>{details.personalInfo.children}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Type of residence</span>
            <span className={styles.infoValue}>{details.personalInfo.residenceType}</span>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Education and Employment</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>level of education</span>
            <span className={styles.infoValue}>{details.educationEmployment.level}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>employment status</span>
            <span className={styles.infoValue}>{details.educationEmployment.employmentStatus}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>sector of employment</span>
            <span className={styles.infoValue}>{details.educationEmployment.sector}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Duration of employment</span>
            <span className={styles.infoValue}>{details.educationEmployment.duration}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>office email</span>
            <span className={styles.infoValue}>{details.educationEmployment.officeEmail}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Monthly income</span>
            <span className={styles.infoValue}>{details.educationEmployment.monthlyIncome}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>loan repayment</span>
            <span className={styles.infoValue}>{details.educationEmployment.loanRepayment}</span>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Socials</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Twitter</span>
            <span className={styles.infoValue}>{details.socials.twitter}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Facebook</span>
            <span className={styles.infoValue}>{details.socials.facebook}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Instagram</span>
            <span className={styles.infoValue}>{details.socials.instagram}</span>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {details.guarantors.map((guarantor, index) => (
        <section key={index} className={styles.section}>
          <h3 className={styles.sectionTitle}>{index === 0 ? 'Guarantor' : ''}</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>full Name</span>
              <span className={styles.infoValue}>{guarantor.fullName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone Number</span>
              <span className={styles.infoValue}>{guarantor.phoneNumber}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email Address</span>
              <span className={styles.infoValue}>{guarantor.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Relationship</span>
              <span className={styles.infoValue}>{guarantor.relationship}</span>
            </div>
          </div>
          {index < details.guarantors.length - 1 && <div className={styles.sectionDivider} />}
        </section>
      ))}
    </>
  );

  const renderTabContent = (details: UserDetailsData) => {
    switch (activeTab) {
      case 'documents':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Documents</h3>
            <div className={styles.tabCardsGrid}>
              <article className={styles.tabCard}>
                <h4 className={styles.tabCardTitle}>Identity Verification</h4>
                <p className={styles.tabCardMeta}>Government ID • Verified</p>
              </article>
              <article className={styles.tabCard}>
                <h4 className={styles.tabCardTitle}>Proof of Address</h4>
                <p className={styles.tabCardMeta}>Utility Bill • Pending Review</p>
              </article>
              <article className={styles.tabCard}>
                <h4 className={styles.tabCardTitle}>Employment Letter</h4>
                <p className={styles.tabCardMeta}>Uploaded • Approved</p>
              </article>
            </div>
          </section>
        );
      case 'bank':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Bank Details</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Account Number</span><span className={styles.infoValue}>{details.accountNumber}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Bank Name</span><span className={styles.infoValue}>{details.bank}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Current Balance</span><span className={styles.infoValue}>{details.balance}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Card Status</span><span className={styles.infoValue}>Active</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Default Currency</span><span className={styles.infoValue}>NGN</span></div>
            </div>
          </section>
        );
      case 'loans':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Loans</h3>
            <div className={styles.tabCardsGrid}>
              <article className={styles.tabCard}><h4 className={styles.tabCardTitle}>Micro Loan</h4><p className={styles.tabCardMeta}>Outstanding: ₦45,000 • Due in 12 days</p></article>
              <article className={styles.tabCard}><h4 className={styles.tabCardTitle}>Salary Advance</h4><p className={styles.tabCardMeta}>Outstanding: ₦12,000 • Due in 5 days</p></article>
            </div>
          </section>
        );
      case 'savings':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Savings</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Total Savings</span><span className={styles.infoValue}>₦320,000.00</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Plan</span><span className={styles.infoValue}>Flex Save</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Monthly Contribution</span><span className={styles.infoValue}>₦25,000.00</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Maturity Date</span><span className={styles.infoValue}>14 Dec 2026</span></div>
            </div>
          </section>
        );
      case 'app':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>App and System</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Last Login</span><span className={styles.infoValue}>11 Apr 2026, 09:13</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Device</span><span className={styles.infoValue}>iPhone 13 • iOS 17</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>2FA</span><span className={styles.infoValue}>Enabled</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>KYC Level</span><span className={styles.infoValue}>Tier {details.tier}</span></div>
            </div>
          </section>
        );
      case 'general':
      default:
        return renderGeneralDetails(details);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonContent} />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.error}>
          <span>{error || 'User not found'}</span>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={onBack}>
        <img src="/media/icons/long-left-arrow.svg" alt="Back" className={styles.backIcon} />
        <span>Back to Users</span>
      </button>

      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>User Details</h1>

        <div className={styles.actionButtons}>
          <button 
            className={styles.blacklistButton}
            onClick={onBlacklist}
          >
            BLACKLIST USER
          </button>
          <button 
            className={styles.activateButton}
            onClick={onActivate}
          >
            ACTIVATE USER
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          {/* Avatar */}
          <div className={styles.avatar}>
            <div className={styles.avatarPlaceholder}>
              <img src="/media/icons/default-user.svg" alt="User avatar" className={styles.avatarIcon} />
            </div>
          </div>

          {/* Name & ID */}
          <div className={styles.nameSection}>
            <h2 className={styles.userName}>{user.fullName}</h2>
            <span className={styles.userId}>{user.userId}</span>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Tier */}
          <div className={styles.tierSection}>
            <span className={styles.tierLabel}>User's Tier</span>
            <div className={styles.stars}>{renderStars(user.tier)}</div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Balance */}
          <div className={styles.balanceSection}>
            <span className={styles.balance}>{user.balance}</span>
            <span className={styles.account}>{user.accountNumber}/{user.bank}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && <div className={styles.tabIndicator} />}
            </button>
          ))}
        </div>
      </div>

      {/* Details Content */}
      <div className={styles.detailsCard}>
        {renderTabContent(user)}
      </div>
    </div>
  );
};

export default UserDetails;