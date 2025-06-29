import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import { useEffect } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebApp() {
  useEffect(() => {
    (async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await Audio.requestPermissionsAsync();

      if (camStatus !== 'granted' || micStatus !== 'granted') {
        Alert.alert('Permissões necessárias', 'Este app precisa de acesso à câmera e microfone.');
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <WebView
        source={{ uri: 'https://plataformajornada.com.br' }}
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
