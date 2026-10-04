import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, useWindowDimensions } from 'react-native';
import { getPhotoUri } from '../lib/scanStore';

export default function Result() {
  const { source, barcode } = useLocalSearchParams<{
    source?: string; barcode?: string;
  }>();
  const { width } = useWindowDimensions();
  const [photoUri] = useState<string | null>(getPhotoUri());
  const [status, setStatus] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text>Source: {source}</Text>
      {barcode ? <Text>Barcode: {barcode}</Text> : null}

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: width - 32, height: 400, backgroundColor: '#ddd' }}
          resizeMode="contain"
          onError={(e) => setStatus(e.nativeEvent.error)}
          onLoad={() => setStatus('loaded OK')}
        />
      ) : null}

      {status ? <Text>Image status: {status}</Text> : null}
    </ScrollView>
  );
}