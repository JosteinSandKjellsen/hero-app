import './print.css';

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
