export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--ink3)',
        lineHeight: 1.6,
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      AI Car Buyer fournit une assistance basée sur les données disponibles publiquement. Les
      recommandations ne garantissent ni l'exactitude des données, ni l'état mécanique, ni la valeur
      réelle des véhicules. Une expertise reste recommandée avant tout achat.
    </footer>
  );
}
