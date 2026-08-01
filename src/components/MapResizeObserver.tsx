import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export function MapResizeObserver() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const container = map.getDiv();

    function triggerResize() {
      if (!map) return;
      const center = map.getCenter();
      google.maps.event.trigger(map, 'resize');
      if (center) map.setCenter(center);
    }

    const raf = requestAnimationFrame(triggerResize);
    const observer = new ResizeObserver(triggerResize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [map]);

  return null;
}
