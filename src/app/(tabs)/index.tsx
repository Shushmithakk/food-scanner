import { useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { setPhotoUri } from '../../lib/scanStore';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [locked, setLocked] = useState(false);
  const router = useRouter();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera access is needed to scan food.</Text>
        <Button title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  const onBarcode = ({ data }: { data: string }) => {
    if (locked) return;
    setLocked(true);
    setPhotoUri(null);
    router.push({ pathname: '/result', params: { source: 'barcode', barcode: data } });
    setTimeout(() => setLocked(false), 2500);
  };

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5 });
    if (photo) {
      setPhotoUri(photo.uri);
      router.push({ pathname: '/result', params: { source: 'label_photo' } });
    }
  };

  return (
    <CameraView
      ref={cameraRef}
      style={styles.camera}
      barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
      onBarcodeScanned={onBarcode}
    >
      <View style={styles.frame} />
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shutter} onPress={takePhoto}>
          <Text style={styles.shutterText}>Capture</Text>
        </TouchableOpacity>
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  frame: {
    position: 'absolute', top: '30%', left: '10%', right: '10%', height: 160,
    borderWidth: 2, borderColor: 'white', borderRadius: 12,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  shutter: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: 'white',
    borderWidth: 5, borderColor: '#999', justifyContent: 'center', alignItems: 'center',
  },
  shutterText: { fontSize: 12, fontWeight: '600', color: '#333' },
});