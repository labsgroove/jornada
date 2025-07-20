import { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { requestPermissionsAsync as requestAudioPermissionsAsync } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';

export default function WebApp() {
  const webViewRef = useRef(null);
  const [awake, setAwake] = useState(false);

  useKeepAwake();

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await requestAudioPermissionsAsync();

      if (camStatus !== 'granted' || micStatus !== 'granted') {
        Alert.alert('Permissões necessárias', 'Este app precisa de acesso à câmera e microfone.');
      }
    })();
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
        source={{ uri: 'https://www.plataformajornada.com.br/index.php?r=site/logout' }}
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
