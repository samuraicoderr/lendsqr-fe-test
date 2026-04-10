import styles from './Auth.module.scss';
import FrontendLinks from '@/lib/FrontendLinks';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.container}>
      {/* Left Side - Illustration */}
      <div className={styles.illustrationSection}>
        {/* LEFT LOGO (kept exactly the way it was) */}
        <div className={styles.logo}>
          <Link href={FrontendLinks.mainWebsite} target="_blank" rel="noopener noreferrer">
            <img
              src="/media/logos/main-logo.svg"
              alt="Lendsqr Logo"
              className={styles.lendsqrLogo}
            />
          </Link>
        </div>

        <div className={styles.illustration}>
          <img
            src="/media/images/pablo-sign-in.png"
            alt="Login Illustration"
            className={styles.illustrationSvg}
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.formSection}>
        {/* RIGHT LOGO (only shows when left panel collapses) */}
        <div className={styles.logoRight}>
          <Link href={FrontendLinks.mainWebsite} target="_blank" rel="noopener noreferrer">
            <img
              src="/media/logos/main-logo.svg"
              alt="Lendsqr Logo"
              className={styles.lendsqrLogo}
            />
          </Link>
        </div>

        <div className={styles.formContainer}>{children}</div>
      </div>
    </div>
  );
}