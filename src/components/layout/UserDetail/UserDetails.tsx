"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import FrontendLinks from "@/lib/FrontendLinks";
import Link from "next/link";
import styles from "./UserDetails.module.scss";
import UserService from "@/lib/api/services/User.Service";
import type { UserDetailsData } from "@/lib/api/types/user.types";

interface UserDetailsProps {
  userId?: string;
  onBack?: () => void;
  onBlacklist?: () => void;
  onActivate?: () => void;
  className?: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({
  userId = "1",
  onBack,
  onBlacklist,
  onActivate,
  className = "",
}) => {
  const [user, setUser] = useState<UserDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UserService.getUserById(userId);
      setUser(data);
    } catch (loadError) {
      console.error("[UserDetails] Failed to load user:", loadError);
      setError(loadError instanceof Error ? loadError.message : "Failed to load user details");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const tabs = useMemo(
    () => [
      { id: "general", label: "General Details" },
      { id: "documents", label: "Documents" },
      { id: "bank", label: "Bank Details" },
      { id: "loans", label: "Loans" },
      { id: "savings", label: "Savings" },
      { id: "app", label: "App and System" },
    ],
    []
  );

  const renderStars = (tier: number) => {
    return Array.from({ length: 3 }, (_, index) => (
      <img
        key={index}
        src={index < tier ? "/media/icons/orange-star-filled.svg" : "/media/icons/orange-star-outlined.svg"}
        alt={index < tier ? "Filled star" : "Outlined star"}
        className={index < tier ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  const persistStatus = async (status: NonNullable<UserDetailsData["status"]>) => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await UserService.patchUser(user.id, { status });
      setUser(updatedUser);
    } catch (updateError) {
      console.error("[UserDetails] Failed to update status:", updateError);
      setError(updateError instanceof Error ? updateError.message : "Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklist = async () => {
    onBlacklist?.();
    await persistStatus("Blacklisted");
  };

  const handleActivate = async () => {
    onActivate?.();
    await persistStatus("Active");
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
        <section key={`${guarantor.fullName}-${index}`} className={styles.section}>
          <h3 className={styles.sectionTitle}>{index === 0 ? "Guarantor" : ""}</h3>
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
      case "documents":
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
      case "bank":
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Bank Details</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Account Number</span>
                <span className={styles.infoValue}>{details.accountNumber}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Bank Name</span>
                <span className={styles.infoValue}>{details.bank}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Current Balance</span>
                <span className={styles.infoValue}>{details.balance}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Card Status</span>
                <span className={styles.infoValue}>Active</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Default Currency</span>
                <span className={styles.infoValue}>NGN</span>
              </div>
            </div>
          </section>
        );
      case "loans":
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Loans</h3>
            <div className={styles.tabCardsGrid}>
              <article className={styles.tabCard}>
                <h4 className={styles.tabCardTitle}>Micro Loan</h4>
                <p className={styles.tabCardMeta}>Outstanding: ₦45,000 • Due in 12 days</p>
              </article>
              <article className={styles.tabCard}>
                <h4 className={styles.tabCardTitle}>Salary Advance</h4>
                <p className={styles.tabCardMeta}>Outstanding: ₦12,000 • Due in 5 days</p>
              </article>
            </div>
          </section>
        );
      case "savings":
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Savings</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Total Savings</span>
                <span className={styles.infoValue}>₦320,000.00</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Plan</span>
                <span className={styles.infoValue}>Flex Save</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Monthly Contribution</span>
                <span className={styles.infoValue}>₦25,000.00</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Maturity Date</span>
                <span className={styles.infoValue}>14 Dec 2026</span>
              </div>
            </div>
          </section>
        );
      case "app":
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>App and System</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Login</span>
                <span className={styles.infoValue}>11 Apr 2026, 09:13</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Device</span>
                <span className={styles.infoValue}>iPhone 13 • iOS 17</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>2FA</span>
                <span className={styles.infoValue}>Enabled</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>KYC Level</span>
                <span className={styles.infoValue}>Tier {details.tier}</span>
              </div>
            </div>
          </section>
        );
      case "general":
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
          <span>{error || "User not found"}</span>
          <button onClick={() => void loadUser()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <Link className={styles.backButton} href={FrontendLinks.users} onClick={onBack}>
        <img src="/media/icons/long-left-arrow.svg" alt="Back" className={styles.backIcon} />
        <span>Back to Users</span>
      </Link>

      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>User Details</h1>

        <div className={styles.actionButtons}>
          <button className={styles.blacklistButton} onClick={() => void handleBlacklist()}>
            BLACKLIST USER
          </button>
          <button className={styles.activateButton} onClick={() => void handleActivate()}>
            ACTIVATE USER
          </button>
        </div>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            <div className={styles.avatarPlaceholder}>
              <img src="/media/icons/default-user.svg" alt="User avatar" className={styles.avatarIcon} />
            </div>
          </div>

          <div className={styles.nameSection}>
            <h2 className={styles.userName}>{user.fullName}</h2>
            <span className={styles.userId}>{user.userId}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.tierSection}>
            <span className={styles.tierLabel}>User's Tier</span>
            <div className={styles.stars}>{renderStars(user.tier)}</div>
          </div>

          <div className={styles.divider} />

          <div className={styles.balanceSection}>
            <span className={styles.balance}>{user.balance}</span>
            <span className={styles.account}>{user.accountNumber}/{user.bank}</span>
          </div>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && <div className={styles.tabIndicator} />}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.detailsCard}>{renderTabContent(user)}</div>
    </div>
  );
};

export default UserDetails;
