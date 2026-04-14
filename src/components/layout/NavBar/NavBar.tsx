"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.scss';
import FrontendLinks from '@/lib/FrontendLinks';

interface NavbarProps {
  userName?: string;
  userAvatar?: string;
  onHamburgerClick?: () => void;
  onSearch?: (query: string) => void;
  onDocsClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  userName = 'Williams',
  userAvatar = '/avatar.png',
  onHamburgerClick,
  onSearch,
  onDocsClick,
  onNotificationClick,
  onProfileClick,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationCount] = useState(4);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarInner}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <button
            type="button"
            className={styles.hamburgerButton}
            aria-label="Open navigation menu"
            onClick={() => onHamburgerClick?.()}
          >
            <span className={styles.hamburgerLine} aria-hidden="true" />
            <span className={styles.hamburgerLine} aria-hidden="true" />
            <span className={styles.hamburgerLine} aria-hidden="true" />
          </button>
          <a href="/" className={styles.logoLink} aria-label="Lendsqr Home">
            <img src="/media/logos/main-logo.svg" alt="Lendsqr Logo" className={styles.logoIcon}/>
          </a>
        </div>

        {/* Search Section */}
        <form 
          className={`${styles.searchSection} ${isSearchFocused ? styles.searchFocused : ''}`} 
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <div className={styles.searchWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search for anything"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              aria-label="Search for anything"
            />
            <button 
              type="submit" 
              className={styles.searchButton}
              aria-label="Submit search"
            >
              <img src="/media/icons/search.svg" alt="Search Icon" className={styles.searchIcon}/>
            </button>
          </div>
        </form>

        {/* Actions Section */}
        <div className={styles.actionsSection}>
          {/* Docs Link */}
          <a 
            href="#" 
            className={styles.docsLink}
            onClick={(e) => {
              e.preventDefault();
              onDocsClick?.();
            }}
          >
            Docs
          </a>

          {/* Notification Bell */}
          <button 
            type="button"
            className={styles.notificationButton}
            onClick={onNotificationClick}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <img src="/media/icons/bell.svg" alt="Notification Bell" className={styles.bellIcon}/>
            {notificationCount > 0 && (
              <span className={styles.notificationBadge}>{notificationCount}</span>
            )}
          </button>

          {/* User Profile */}
          <div className={styles.profileSection} ref={dropdownRef}>
            <button 
              className={styles.profileButton}
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label={`User menu for ${userName}`}
            >
              <div className={styles.avatarWrapper}>
                <img 
                  src={userAvatar} 
                  alt="" 
                  className={styles.avatar}
                  width={48}
                  height={48}
                />
              </div>
              <span className={styles.userName}>{userName}</span>
              <img src="/media/icons/chevron-down.svg" alt="Dropdown Icon" className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.dropdownIconOpen : ''}`}/>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className={styles.dropdownMenu} role="menu">
                <button 
                  className={styles.dropdownItem}
                  onClick={() => {
                    onProfileClick?.();
                    setIsDropdownOpen(false);
                  }}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M13.3333 14V12.6667C13.3333 11.9594 13.0524 11.2811 12.5523 10.781C12.0522 10.281 11.3739 10 10.6667 10H5.33333C4.62609 10 3.94781 10.281 3.44772 10.781C2.94762 11.2811 2.66667 11.9594 2.66667 12.6667V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 7.33333C9.47276 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667C5.33333 6.13943 6.52724 7.33333 8 7.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Profile
                </button>
                <button 
                  className={styles.dropdownItem}
                  onClick={() => {
                    onLogout?.();
                    setIsDropdownOpen(false);
                  }}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

  );
};

export default Navbar;