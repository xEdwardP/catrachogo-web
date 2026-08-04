export const ROUTE_COLOR = '#E8532E';
export const ORIGIN_MARKER_COLOR = '#158059';
export const DRIVER_MARKER_COLOR = '#2563EB';

function pulseMarkerSvg(color: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="10" fill="${color}" fill-opacity="0.55">
    <animate attributeName="r" values="10;28" dur="2.4s" begin="0s" repeatCount="indefinite" />
    <animate attributeName="fill-opacity" values="0.55;0" dur="2.4s" begin="0s" repeatCount="indefinite" />
  </circle>
  <circle cx="32" cy="32" r="10" fill="${color}" fill-opacity="0.55">
    <animate attributeName="r" values="10;28" dur="2.4s" begin="0.9s" repeatCount="indefinite" />
    <animate attributeName="fill-opacity" values="0.55;0" dur="2.4s" begin="0.9s" repeatCount="indefinite" />
  </circle>
  <circle cx="32" cy="32" r="7" fill="${color}" stroke="#ffffff" stroke-width="2.5" />
</svg>
`.trim();
}

function pulseMarkerIcon(color: string): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pulseMarkerSvg(color))}`,
    scaledSize: new google.maps.Size(64, 64),
    anchor: new google.maps.Point(32, 32),
  };
}

export function originPulseMarkerIcon(): google.maps.Icon {
  return pulseMarkerIcon(ORIGIN_MARKER_COLOR);
}

export function driverPulseMarkerIcon(): google.maps.Icon {
  return pulseMarkerIcon(DRIVER_MARKER_COLOR);
}

export function tripMarkerLabel(text: string, color = '#ffffff'): google.maps.MarkerLabel {
  return {
    text,
    color,
    fontSize: '11px',
    fontWeight: '700',
  };
}
