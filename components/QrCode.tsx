import QR from 'qrcode';

/** A QR code drawn on the server as inline SVG (no image request, sharp at any size). */
export async function QrCode({ value, size = 140, label }: { value: string; size?: number; label: string }) {
  const svg = await QR.toString(value, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#2a1d14', light: '#ffffff' } });
  return (
    <div
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
      className="overflow-hidden rounded-card border border-line bg-white p-1.5 [&>svg]:size-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
