"use client";

import { useEffect } from "react";
import styles from "./NotificationsPanel.module.scss";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  when: string;
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
    unread: true,
  },
  {
    id: "2",
    title: "Settlement completed",
    body: "Yesterday's batch settlement completed successfully across all providers.",
    when: "18 minutes ago",
    unread: true,
  },
  {
    id: "3",
    title: "Service health warning",
    body: "Credit Bureau response time is above threshold. Monitoring is active.",
    when: "48 minutes ago",
    unread: true,
  },
  {
    id: "4",
    title: "KYC verification spike",
    body: "KYC verifications increased by 24% in the last hour.",
    when: "1 hour ago",
  },
  {
    id: "5",
    title: "Daily report generated",
    body: "Loan portfolio risk summary report is ready for download.",
    when: "3 hours ago",
  },
];

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscape);
    };
  }, [open, onClose]);

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

        <div className={styles.list}>
          {sampleNotifications.map((item) => (
            <article key={item.id} className={`${styles.item} ${item.unread ? styles.unread : ""}`}>
              <span className={styles.dot} aria-hidden="true" />
              <div className={styles.content}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemBody}>{item.body}</p>
                <span className={styles.itemMeta}>{item.when}</span>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.actionButton}>Mark all as read</button>
          <button type="button" className={`${styles.actionButton} ${styles.primaryButton}`}>View all alerts</button>
        </div>
      </aside>
    </>
  );
}
