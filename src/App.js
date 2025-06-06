import React, { useState, useEffect } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup,
  useMapEvents, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const toiletIconYes = L.icon({
  iconUrl: process.env.PUBLIC_URL + '/toilet_yes.svg',
  iconSize: [40, 40],
  iconAnchor: [15, 30],
});
const toiletIconNo = L.icon({
  iconUrl: process.env.PUBLIC_URL + '/toilet_no.svg',
  iconSize: [40, 40],
  iconAnchor: [15, 30],
});

function App() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ name: '', lat: '', lng: '', hasToiletPaper: true });
  const [previewLocation, setPreviewLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showGuide, setShowGuide] = useState(() => !localStorage.getItem('guideShown'));

  // Firestoreからリアルタイム取得
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'toilets'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocations(data);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newLocation = {
      name: form.name,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      hasToiletPaper: form.hasToiletPaper,
    };
    await addDoc(collection(db, 'toilets'), newLocation);
    setForm({ name: '', lat: '', lng: '', hasToiletPaper: true });
    setPreviewLocation(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    deleteDoc(doc(db, 'toilets', id));
  };

  const handleCancel = () => {
    setShowModal(false);
    setPreviewLocation(null);
    setForm({ name: '', lat: '', lng: '', hasToiletPaper: true });
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPreviewLocation({ lat, lng });
        setForm(prev => ({
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
        pos => {
          const { latitude, longitude } = pos.coords;
          const latlng = [latitude, longitude];
          setPosition(latlng);
          map.setView(latlng, 16);
        },
        err => {
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

  const handleGuideClose = () => {
    localStorage.setItem('guideShown', 'true');
    setShowGuide(false);
  };

  return (
    <div className="App">
      {showGuide && (
        <div className="guide-overlay">
          <div className="guide-content">
            <h2> セブ島トイレットペーパーマップ</h2>
            <p> ⚪︎トイパの有無をみんなで共有しよう</p>
            <p> ⚪︎トイレを見つけた場所をタップ！地図に追加しよう🧻</p>
            <button onClick={handleGuideClose}>はじめる</button>
          </div>
        </div>
      )}

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
              key={loc.id || index}
              position={[loc.lat, loc.lng]}
              icon={loc.hasToiletPaper ? toiletIconYes : toiletIconNo}
            >
              <Popup>
                <strong>{loc.name}</strong>
                <br />
                {loc.hasToiletPaper ? '🧻 トイパあり' : '❌ トイパなし'}
                <br />
                <button
                  onClick={() => handleDelete(loc.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '8px',
                    color: '#aaa',
                    float: 'right'
                  }}
                  title="削除"
                >
                  削除する
                </button>
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
            <h2>トイレを見つけた！</h2>
            <form onSubmit={handleSubmit} className="toilet-form">
              <label>
                名前：
                <input type="text" name="name" placeholder="○○カフェ2階" value={form.name} onChange={handleChange} required />
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
                トイレットペーパあり🧻
              </label>
              <div className="modal-buttons">
                <button type="button" onClick={handleCancel}>キャンセル</button>
                <button type="submit">＋追加する</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
