import Link from "next/link";
import styles from "./RecordDetail.module.scss";

type DetailItem = {
  label: string;
  value: string;
};

type RecordDetailProps = {
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  recordId: string;
  items: DetailItem[];
  className?: string;
};

export default function RecordDetail({
  title,
  subtitle,
  backHref,
  backLabel,
  recordId,
  items,
  className = "",
}: RecordDetailProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <Link className={styles.backLink} href={backHref}>
        <img src="/media/icons/long-left-arrow.svg" alt="Back" width={20} height={20} />
        <span>{backLabel}</span>
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
        <span className={styles.badge}>ID: {recordId}</span>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.label} className={styles.card}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
