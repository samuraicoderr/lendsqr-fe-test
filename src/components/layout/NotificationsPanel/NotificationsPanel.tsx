"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./NotificationsPanel.module.scss";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  when: string;
  category: "risk" | "operations" | "systems" | "reports";
  source: string;
  unread?: boolean;
};

type NotificationsPanelProps = {
  open: boolean;
  onClose: () => void;
};

const sampleNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Large loan request awaiting review",
    body: "A new request for NGN 2,500,000 from Tolani Bakare needs a decision.",
    when: "2 minutes ago",
    category: "risk",
    source: "Loan Requests",
    unread: true,
  },
  {
    id: "2",
    title: "Settlement completed",
    body: "Yesterday's batch settlement completed successfully across all providers.",
    when: "18 minutes ago",
    category: "operations",
    source: "Settlements",
    unread: true,
  },
  {
    id: "3",
    title: "Service health warning",
    body: "Credit Bureau response time is above threshold. Monitoring is active.",
    when: "48 minutes ago",
    category: "systems",
    source: "Service Monitoring",
    unread: true,
  },
  {
    id: "4",
    title: "KYC verification spike",
    body: "KYC verifications increased by 24% in the last hour.",
    when: "1 hour ago",
    category: "operations",
    source: "KYC",
  },
  {
    id: "5",
    title: "Daily report generated",
    body: "Loan portfolio risk summary report is ready for download.",
    when: "3 hours ago",
    category: "reports",
    source: "Reports",
  },
];

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(sampleNotifications);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((notification) => notification.unread);
    }
    return notifications;
  }, [activeFilter, notifications]);

  const selectedNotification = useMemo(
    () => notifications.find((notification) => notification.id === selectedId) ?? null,
    [notifications, selectedId]
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, unread: false })));
  };

  const openDetail = (notification: NotificationItem) => {
    markAsRead(notification.id);
    setSelectedId(notification.id);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedId) {
          setSelectedId(null);
          return;
        }
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscape);
    };
  }, [open, onClose, selectedId]);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setActiveFilter("all");
    }
  }, [open]);

  return (
    <>
      <button
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        type="button"
        onClick={onClose}
        aria-label="Close notifications panel"
      />
      <aside
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-hidden={!open}
        aria-label="Notifications"
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Notifications</h2>
            <span className={styles.subtitle}>Stay on top of platform activity</span>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filterGroup} role="tablist" aria-label="Notification filters">
            <button
              type="button"
              className={`${styles.filterButton} ${activeFilter === "all" ? styles.filterButtonActive : ""}`}
              onClick={() => setActiveFilter("all")}
              role="tab"
              aria-selected={activeFilter === "all"}
            >
              All
            </button>
            <button
              type="button"
              className={`${styles.filterButton} ${activeFilter === "unread" ? styles.filterButtonActive : ""}`}
              onClick={() => setActiveFilter("unread")}
              role="tab"
              aria-selected={activeFilter === "unread"}
            >
              Unread
            </button>
          </div>
          <span className={styles.unreadCount}>{unreadCount} unread</span>
        </div>

        <div className={styles.list}>
          {visibleNotifications.length === 0 && (
            <div className={styles.emptyState}>No notifications for this filter.</div>
          )}
          {visibleNotifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.item} ${item.unread ? styles.unread : ""}`}
              onClick={() => openDetail(item)}
              aria-label={`Open notification: ${item.title}`}
            >
              <span className={styles.dot} aria-hidden="true" />
              <div className={styles.content}>
                <div className={styles.itemTopRow}>
                  <span className={styles.source}>{item.source}</span>
                  <span className={styles.itemMeta}>{item.when}</span>
                </div>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemBody}>{item.body}</p>
              </div>
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.actionButton} onClick={markAllAsRead}>Mark all as read</button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.primaryButton}`}
            onClick={() => setActiveFilter(activeFilter === "all" ? "unread" : "all")}
          >
            {activeFilter === "all" ? "Focus unread" : "Show all"}
          </button>
        </div>

        <div className={`${styles.detailPane} ${selectedNotification ? styles.detailPaneOpen : ""}`}>
          {selectedNotification && (
            <>
              <div className={styles.detailHeader}>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to notifications"
                >
                  ←
                </button>
                <div>
                  <p className={styles.detailKicker}>{selectedNotification.source}</p>
                  <h3 className={styles.detailTitle}>{selectedNotification.title}</h3>
                </div>
              </div>
              <div className={styles.detailBody}>
                <p>{selectedNotification.body}</p>
                <div className={styles.detailMetaRow}>
                  <span>{selectedNotification.when}</span>
                  <span className={styles.categoryBadge}>{selectedNotification.category}</span>
                </div>
              </div>
              <div className={styles.detailFooter}>
                <button type="button" className={styles.actionButton} onClick={() => setSelectedId(null)}>
                  Back
                </button>
                <button type="button" className={`${styles.actionButton} ${styles.primaryButton}`}>
                  Open source
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
