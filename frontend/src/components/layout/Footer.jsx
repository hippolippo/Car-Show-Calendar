// T034: Footer layout component

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p>&copy; 2026 CarCalendar. Discover car shows and meets in your area.</p>
        <p style={styles.version}>v1.0.0-MVP</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#f8f9fa',
    padding: '2rem 1rem',
    marginTop: 'auto',
    borderTop: '1px solid #dee2e6'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '0.9rem'
  },
  version: {
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    opacity: 0.7
  }
};
