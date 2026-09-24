import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number;
};

const buildHtml = (lat: number, lng: number, zoom: number) => `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0}</style>
</head><body><div id="map"></div><script>
  var map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${lat}, ${lng}], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
  }).addTo(map);
  var marker = L.marker([${lat}, ${lng}]).addTo(map);
  function setPos(lat, lng) {
    marker.setLatLng([lat, lng]);
    marker.bindPopup(lat.toFixed(5) + ', ' + lng.toFixed(5));
    map.setView([lat, lng], map.getZoom());
  }
  setPos(${lat}, ${lng});
</script></body></html>`;

export const LeafletMap = ({ lat, lng, zoom = 13, height = 260 }: Props) => {
  const webRef = useRef<WebView>(null);
  const html = useMemo(() => buildHtml(lat, lng, zoom), [lat, lng, zoom]);

  useEffect(() => {
    webRef.current?.injectJavaScript(`setPos(${lat}, ${lng}); true;`);
  }, [lat, lng]);

  return (
    <View style={[styles.frame, { height }]}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.web}
        scrollEnabled={false}
        nestedScrollEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  frame: { overflow: "hidden" },
  web: { flex: 1, backgroundColor: "transparent" },
});
