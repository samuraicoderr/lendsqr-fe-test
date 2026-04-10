"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './SideBar.module.scss';

interface NavItem {
  id: string;
  label: string;
  iconSrc: string;
  href?: string;
  active?: boolean;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
  defaultExpanded?: boolean;
}

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (itemId: string) => void;
  onLogout?: () => void;
  onSwitchOrganization?: () => void;
  className?: string;
  mobileMenuToggleSignal?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onNavigate,
  onLogout,
  onSwitchOrganization,
  className = '',
  mobileMenuToggleSignal,
}) => {
  const organizations = ['Lendsqr HQ', 'Lendsqr Finance', 'Lendsqr Labs'];
  const pathname = usePathname();
  const iconBasePath = '/media/icons';

  // Navigation sections data
  const sections: NavSection[] = [
    {
      id: 'customers',
      label: 'CUSTOMERS',
      defaultExpanded: true,
      items: [
        { id: 'users', label: 'Users', iconSrc: `${iconBasePath}/user-friends.svg`, href: '/dashboard/users' },
        { id: 'guarantors', label: 'Guarantors', iconSrc: `${iconBasePath}/users.svg`, href: '/dashboard/guarantors' },
        { id: 'loans', label: 'Loans', iconSrc: `${iconBasePath}/sack.svg`, href: '/dashboard/loans' },
        { id: 'decision-models', label: 'Decision Models', iconSrc: `${iconBasePath}/handshake-regular.svg`, href: '/dashboard/decision-models' },
        { id: 'savings', label: 'Savings', iconSrc: `${iconBasePath}/piggy-bank.svg`, href: '/dashboard/savings' },
        { id: 'loan-requests', label: 'Loan Requests', iconSrc: `${iconBasePath}/Group.svg`, href: '/dashboard/loan-requests' },
        { id: 'whitelist', label: 'Whitelist', iconSrc: `${iconBasePath}/user-check.svg`, href: '/dashboard/whitelist' },
        { id: 'karma', label: 'Karma', iconSrc: `${iconBasePath}/user-times.svg`, href: '/dashboard/karma' },
      ],
    },
    {
      id: 'businesses',
      label: 'BUSINESSES',
      defaultExpanded: true,
      items: [
        { id: 'organization', label: 'Organization', iconSrc: `${iconBasePath}/briefcase.svg`, href: '/dashboard/organization' },
        { id: 'loan-products', label: 'Loan Products', iconSrc: `${iconBasePath}/sack.svg`, href: '/dashboard/loan-products' },
        { id: 'savings-products', label: 'Savings Products', iconSrc: `${iconBasePath}/np_bank.svg`, href: '/dashboard/savings-products' },
        { id: 'fees-charges', label: 'Fees and Charges', iconSrc: `${iconBasePath}/coins-solid.svg`, href: '/dashboard/fees-charges' },
        { id: 'transactions', label: 'Transactions', iconSrc: `${iconBasePath}/icon.svg`, href: '/dashboard/transactions' },
        { id: 'services', label: 'Services', iconSrc: `${iconBasePath}/galaxy.svg`, href: '/dashboard/services' },
        { id: 'service-account', label: 'Service Account', iconSrc: `${iconBasePath}/user-cog.svg`, href: '/dashboard/service-account' },
        { id: 'settlements', label: 'Settlements', iconSrc: `${iconBasePath}/scroll.svg`, href: '/dashboard/settlements' },
        { id: 'reports', label: 'Reports', iconSrc: `${iconBasePath}/chart-bar.svg`, href: '/dashboard/reports' },
      ],
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      defaultExpanded: true,
      items: [
        { id: 'preferences', label: 'Preferences', iconSrc: `${iconBasePath}/sliders.svg`, href: '/dashboard/preferences' },
        { id: 'fees-pricing', label: 'Fees and Pricing', iconSrc: `${iconBasePath}/badge-percent.svg`, href: '/dashboard/fees-pricing' },
        { id: 'audit-logs', label: 'Audit Logs', iconSrc: `${iconBasePath}/clipboard-list.svg`, href: '/dashboard/audit-logs' },
        { id: 'systems-messages', label: 'Systems Messages', iconSrc: `${iconBasePath}/bell.svg`, href: '/dashboard/systems-messages' },
      ],
    },
  ];

  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(section => {
      initial[section.id] = section.defaultExpanded ?? true;
    });
    return initial;
  });

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0]);
  const [isOrganizationListOpen, setIsOrganizationListOpen] = useState(false);
  
  // Refs for scroll container and animation
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousToggleSignalRef = useRef<number | undefined>(mobileMenuToggleSignal);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((item: NavItem) => {
    onNavigate?.(item.id);
    // Close mobile menu on navigation
    setIsMobileMenuOpen(false);
  }, [onNavigate]);

  const isPathActive = useCallback(
    (href?: string) => {
      if (!href) {
        return false;
      }

      if (pathname === href) {
        return true;
      }

      if (href !== '/dashboard' && pathname?.startsWith(`${href}/`)) {
        return true;
      }

      return false;
    },
    [pathname]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSection(sectionId);
    }
  }, [toggleSection]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuToggleSignal === undefined) {
      return;
    }

    if (previousToggleSignalRef.current === undefined) {
      previousToggleSignalRef.current = mobileMenuToggleSignal;
      return;
    }

    if (mobileMenuToggleSignal !== previousToggleSignalRef.current) {
      setIsMobileMenuOpen((prev) => !prev);
      previousToggleSignalRef.current = mobileMenuToggleSignal;
    }
  }, [mobileMenuToggleSignal]);

  const isDashboardActive = isPathActive('/dashboard');

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''} ${className}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={styles.sidebarInner}>
          {/* Scrollable Content */}
          <div className={styles.scrollContainer} ref={scrollContainerRef}>
            <div className={styles.content} ref={contentRef}>
              {/* Switch Organization */}
              <div className={styles.switchOrg}>
                <button 
                  className={`${styles.navLink} ${styles.switchOrgButton}`}
                  type="button"
                  onClick={() => {
                    setIsOrganizationListOpen((prev) => !prev);
                    onSwitchOrganization?.();
                  }}
                  aria-label="Switch Organization"
                  aria-expanded={isOrganizationListOpen}
                  aria-controls="organization-list"
                >
                  <span className={styles.navIcon}>
                    <img src={`${iconBasePath}/briefcase.svg`} alt="" className={styles.iconImage} />
                  </span>
                  <span className={styles.navLabel}>Switch Organization</span>
                  <span className={`${styles.switchOrgChevron} ${isOrganizationListOpen ? styles.switchOrgChevronOpen : ''}`}>
                    <img src={`${iconBasePath}/chevron-down-thin.svg`} alt="" className={styles.chevronIcon} />
                  </span>
                </button>

                <div
                  id="organization-list"
                  className={`${styles.organizationList} ${isOrganizationListOpen ? styles.organizationListOpen : ''}`}
                >
                  {organizations.map((organization) => {
                    const isActiveOrg = organization === selectedOrganization;

                    return (
                      <button
                        key={organization}
                        type="button"
                        className={`${styles.organizationItem} ${isActiveOrg ? styles.organizationItemActive : ''}`}
                        onClick={() => {
                          setSelectedOrganization(organization);
                          onSwitchOrganization?.();
                        }}
                      >
                        {organization}
                        {isActiveOrg && <span className={styles.organizationActiveTag}> (active)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dashboard */}
              <div className={styles.dashboard}>
                <a 
                  href="/dashboard" 
                  className={`${styles.navLink} ${isDashboardActive ? styles.navLinkActive : ''}`}
                  onClick={(e) => {
                    handleNavigate({ id: 'dashboard', label: 'Dashboard', iconSrc: `${iconBasePath}/home.svg`, href: '/dashboard' });
                    if (onNavigate) {
                      e.preventDefault();
                    }
                  }}
                  aria-current={isDashboardActive ? 'page' : undefined}
                >
                  {isDashboardActive && <span className={styles.activeStripe} aria-hidden="true" />}
                  {isDashboardActive && <span className={styles.activeBackground} aria-hidden="true" />}
                  <span className={`${styles.navIcon} ${isDashboardActive ? styles.navIconActive : ''}`}>
                    <img src={`${iconBasePath}/home.svg`} alt="" className={styles.iconImage} />
                  </span>
                  <span className={`${styles.navLabel} ${isDashboardActive ? styles.navLabelActive : ''}`}>Dashboard</span>
                </a>
              </div>

              {/* Navigation Sections */}
              <nav className={styles.navigation}>
                {sections.map((section) => (
                  <div key={section.id} className={styles.section}>
                    {/* Section Header - Clickable to collapse */}
                    <button
                      className={styles.sectionHeader}
                      onClick={() => toggleSection(section.id)}
                      onKeyDown={(e) => handleKeyDown(e, section.id)}
                      aria-expanded={expandedSections[section.id]}
                      aria-controls={`section-${section.id}-content`}
                    >
                      <span className={styles.sectionLabel}>{section.label}</span>
                    </button>

                    {/* Collapsible Content */}
                    <div 
                      id={`section-${section.id}-content`}
                      className={`${styles.sectionContent} ${expandedSections[section.id] ? styles.sectionContentOpen : ''}`}
                    >
                      <ul className={styles.navList} role="menu">
                        {section.items.map((item) => {
                          const isActive = isPathActive(item.href) || (activeItem ? activeItem === item.id : false);
                          return (
                            <li key={item.id} className={styles.navItem} role="none">
                              <a
                                href={item.href || '#'}
                                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                                onClick={(e) => {
                                  handleNavigate(item);
                                  if (onNavigate) {
                                    e.preventDefault();
                                  }
                                }}
                                role="menuitem"
                                aria-current={isActive ? 'page' : undefined}
                              >
                                {/* Active Indicator Stripe */}
                                {isActive && <span className={styles.activeStripe} aria-hidden="true" />}
                                
                                {/* Active Background */}
                                {isActive && <span className={styles.activeBackground} aria-hidden="true" />}
                                
                                <span className={`${styles.navIcon} ${isActive ? styles.navIconActive : ''}`}>
                                  <img src={item.iconSrc} alt="" className={styles.iconImage} />
                                </span>
                                <span className={`${styles.navLabel} ${isActive ? styles.navLabelActive : ''}`}>
                                  {item.label}
                                </span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Footer - fixed in sidebar */}
          <div className={styles.footer}>
            <div className={styles.divider} role="separator" />

            <button
              className={styles.navLink}
              onClick={onLogout}
              aria-label="Logout"
            >
              <span className={styles.logoutIcon}>
                <img src={`${iconBasePath}/sign-out.svg`} alt="" className={styles.iconImage} />
              </span>
              <span className={styles.logoutText}>Logout</span>
            </button>

            <span className={styles.version}>v1.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;