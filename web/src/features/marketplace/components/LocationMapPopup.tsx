import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationMapPopupProps {
  open: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  title: string;
}

export default function LocationMapPopup({ open, onClose, lat, lng, title }: LocationMapPopupProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Location: {title}</DialogTitle>
      <DialogContent dividers sx={{ height: 500 }}>
        <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          <Marker position={[lat, lng]}>
            <Popup>{title}</Popup>
          </Marker>
        </MapContainer>
      </DialogContent>
    </Dialog>
  );
}