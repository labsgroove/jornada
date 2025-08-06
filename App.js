import { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { useKeepAwake } from 'expo-keep-awake';

export default function WebApp() {
  const webViewRef = useRef(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useKeepAwake();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await requestAudioPermissionsAsync();

      if (camStatus !== 'granted' || micStatus !== 'granted') {
        Alert.alert('Permissões necessárias', 'Este app precisa de acesso à câmera e microfone.');
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.plataformajornada.com.br/index.php?r=site/logout' }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        originWhitelist={['*']}
        useWebKit
      />
    </SafeAreaView>
  );
}
