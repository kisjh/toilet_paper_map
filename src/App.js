import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const toiletsCollection = collection(db, "toilets");

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function App() {
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("現在地取得エラー", err);
      }
    );
  }, []);

  // 🔽 Firestore からデータ取得（リアルタイム）
  useEffect(() => {
    const unsubscribe = onSnapshot(toiletsCollection, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMarkers(data);
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  // 🔼 Firestore に保存
  const handleMapClick = async (latlng) => {
    const confirm = window.confirm("この場所にトイレを追加しますか？");
    if (!confirm) return;
    try {
      await addDoc(toiletsCollection, {
        lat: latlng.lat,
        lng: latlng.lng,
        hasToiletPaper: true,
        createdAt: new Date(),
      });
    } catch (e) {
      console.error("保存に失敗しました", e);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("このマーカーを削除しますか？");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "toilets", id));
    } catch (e) {
      console.error("削除に失敗しました", e);
    }
  };

  return (
    <div className="App">
      <MapContainer
        center={userLocation || [10.3157, 123.8854]}
        zoom={13}
        scrollWheelZoom
        className="map-container"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>あなたの現在地</Popup>
          </Marker>
        )}
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              トイレットペーパーありのトイレ<br />
              <button onClick={() => handleDelete(marker.id)}>削除</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
