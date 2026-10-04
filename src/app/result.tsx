import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image, ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { scanBarcode, scanLabelPhoto } from '../lib/api';
import { getPhotoUri } from '../lib/scanStore';
import { ScanResult } from '../types/scan';

export default function Result() {
  const { source, barcode } = useLocalSearchParams<{
    source?: string; barcode?: string;
  }>();
  const { width } = useWindowDimensions();
  const [photoUri] = useState<string | null>(getPhotoUri());
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (source === 'barcode' && barcode) {
          setResult(await scanBarcode(barcode));
        } else if (source === 'label_photo' && photoUri) {
          setResult(await scanLabelPhoto(photoUri));
        }
      } catch (e) {
        setError('Something went wrong. Check your internet and try again.');
      }
    };
    run();
  }, [source, barcode, photoUri]);

  const n = result?.nutrients_per_100g;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {barcode ? <Text style={{ color: '#666' }}>Barcode: {barcode}</Text> : null}

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: width - 32, height: 260, backgroundColor: '#ddd' }}
          resizeMode="contain"
        />
      ) : null}

      {!result && !error ? <ActivityIndicator size="large" /> : null}
      {error ? <Text>{error}</Text> : null}

      {result ? (
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 22, fontWeight: '700' }}>
            {result.product_name ?? 'Unknown product'}
          </Text>
          <Text>Calories: {n?.energy_kcal ?? '?'} kcal per 100g</Text>
          <Text>Sugar: {n?.sugars_g ?? '?'} g</Text>
          <Text>Protein: {n?.protein_g ?? '?'} g</Text>
          <Text>Salt: {n?.salt_g ?? '?'} g</Text>
          <Text>Confidence: {result.confidence}</Text>
          {result.alerts.map((a, i) => (
            <Text key={i}>⚠ {a.message}</Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}