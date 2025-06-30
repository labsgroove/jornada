import { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { requestPermissionsAsync as requestAudioPermissionsAsync } from 'expo-av';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export default function WebApp() {
  const webViewRef = useRef(null);
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await requestAudioPermissionsAsync();

      if (camStatus !== 'granted' || micStatus !== 'granted') {
        Alert.alert('Permissões necessárias', 'Este app precisa de acesso à câmera e microfone.');
      }
    })();

    return () => {
      deactivateKeepAwake(); // Garante que a tela pode apagar se sair do app
    };
  }, []);

  const handleMessage = async (event) => {
    const msg = event.nativeEvent.data;
    if (msg === 'video-playing') {
      if (!awake) {
        await activateKeepAwakeAsync();
        setAwake(true);
      }
    } else if (msg === 'video-paused') {
      if (awake) {
        deactivateKeepAwake();
        setAwake(false);
      }
    }
  };

  const injectedJS = `
    (function() {
      const setupVideoListeners = () => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          video.addEventListener('play', () => {
            window.ReactNativeWebView.postMessage('video-playing');
          });
          video.addEventListener('pause', () => {
            window.ReactNativeWebView.postMessage('video-paused');
          });
          video.addEventListener('ended', () => {
            window.ReactNativeWebView.postMessage('video-paused');
          });
        });
      };
      document.addEventListener('DOMContentLoaded', setupVideoListeners);
      setTimeout(setupVideoListeners, 1000); // Pega vídeos que carregam depois
    })();
    true;
  `;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://plataformajornada.com.br' }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        originWhitelist={['*']}
        useWebKit
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}
