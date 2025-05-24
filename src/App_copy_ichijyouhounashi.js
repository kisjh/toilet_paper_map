import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function App() {
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('toiletLocations');
    return saved ? JSON.parse(saved) : [
      {
        lat: 10.3173,
        lng: 123.9058,
        name: 'Ayala Center Cebu',
        hasToiletPaper: true,
      }
    ];
  });

  const [form, setForm] = useState({
    name: '',
    lat: '',
    lng: '',
    hasToiletPaper: true,
  });

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
    localStorage.setItem('toiletLocations', JSON.stringify(updated));
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
        setForm((prev) => ({
          ...prev,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
        }));
      },
    });
    return null;
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <MapContainer center={[10.3157, 123.8854]} zoom={13} style={{ height: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapClickHandler />
          {locations.map((loc, index) => (
            <Marker key={index} position={[loc.lat, loc.lng]}>
              <Popup>
                <strong>{loc.name}</strong><br />
                {loc.hasToiletPaper ? '🧻 トイレットペーパーあり' : '❌ なし'}
                <br />
                <button onClick={() => deleteLocation(index)}>🗑 削除</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ width: '300px', padding: '1rem', background: '#f4f4f4' }}>
        <h2>トイレを追加</h2>
        <form onSubmit={handleSubmit}>
          <label>
            名前：
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <br />
          <label>
            緯度：
            <input type="text" name="lat" value={form.lat} onChange={handleChange} required />
          </label>
          <br />
          <label>
            経度：
            <input type="text" name="lng" value={form.lng} onChange={handleChange} required />
          </label>
          <br />
          <label>
            トイレットペーパーあり：
            <input
              type="checkbox"
              name="hasToiletPaper"
              checked={form.hasToiletPaper}
              onChange={handleChange}
            />
          </label>
          <br />
          <button type="submit">追加</button>
        </form>
      </div>
    </div>
  );
}

export default App;
