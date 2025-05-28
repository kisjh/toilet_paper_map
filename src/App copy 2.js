import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const toiletIconYes = L.icon({
  iconUrl: process.env.PUBLIC_URL + '/toilet_yes.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const toiletIconNo = L.icon({
  iconUrl: process.env.PUBLIC_URL + '/toilet_no.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function App() {
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('toiletLocations');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    name: '',
    lat: '',
    lng: '',
    hasToiletPaper: true,
  });

  const [previewLocation, setPreviewLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLocation = {
      name: form.name,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      hasToiletPaper: form.hasToiletPaper,
    };
    const updated = [...locations, newLocation];
    setLocations(updated);
    setForm({ name: '', lat: '', lng: '', hasToiletPaper: true });
    setPreviewLocation(null);
    setShowModal(false);
    localStorage.setItem('toiletLocations', JSON.stringify(updated));
  };

  const handleCancel = () => {
    setShowModal(false);
    setPreviewLocation(null);
    setForm({ name: '', lat: '', lng: '', hasToiletPaper: true });
  };

  const deleteLocation = (index) => {
    const updated = locations.filter((_, i) => i !== index);
    setLocations(updated);
    localStorage.setItem('toiletLocations', JSON.stringify(updated));
  };

  useEffect(() => {
    localStorage.setItem('toiletLocations', JSON.stringify(locations));
  }, [locations]);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPreviewLocation({ lat, lng });
        setForm((prev) => ({
          ...prev,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
        }));
        setShowModal(true);
      },
    });
    return null;
  };

  const CurrentLocationMarker = () => {
    const [position, setPosition] = useState(null);
    const map = useMap();

    useEffect(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const latlng = [latitude, longitude];
          setPosition(latlng);
          map.setView(latlng, 16);
        },
        (err) => {
          console.error('位置情報が取得できませんでした:', err);
        }
      );
    }, [map]);

    return position ? (
      <Marker
        position={position}
        icon={L.divIcon({
          className: 'current-location-icon',
          html: '<div style="background: blue; width: 12px; height: 12px; border-radius: 50%;"></div>',
          iconSize: [12, 12],
        })}
      >
        <Popup>あなたの現在地</Popup>
      </Marker>
    ) : null;
  };

  return (
    <div className="App">
      <div className="map-container">
        <MapContainer center={[10.3157, 123.8854]} zoom={13} style={{ height: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapClickHandler />
          <CurrentLocationMarker />
          {locations.map((loc, index) => (
            <Marker
              key={index}
              position={[loc.lat, loc.lng]}
              icon={loc.hasToiletPaper ? toiletIconYes : toiletIconNo}
            >
              <Popup>
                <strong>{loc.name}</strong>
                <br />
                {loc.hasToiletPaper ? '🧻 トイレットペーパーあり' : '❌ なし'}
                <br />
                <button onClick={() => deleteLocation(index)}>🗑 削除</button>
              </Popup>
            </Marker>
          ))}
          {previewLocation && (
            <Marker position={[previewLocation.lat, previewLocation.lng]}>
              <Popup>新しいトイレの場所（入力して保存）</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>トイレを追加</h2>
            <form onSubmit={handleSubmit} className="toilet-form">
              <label>
                名前：
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </label>
              <input type="hidden" name="lat" value={form.lat} />
              <input type="hidden" name="lng" value={form.lng} />
              <label>
                <input
                  type="checkbox"
                  name="hasToiletPaper"
                  checked={form.hasToiletPaper}
                  onChange={handleChange}
                />
                トイレットペーパーあり
              </label>
              <div className="modal-buttons">
                <button type="button" onClick={handleCancel}>キャンセル</button>
                <button type="submit">➕ 追加</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
