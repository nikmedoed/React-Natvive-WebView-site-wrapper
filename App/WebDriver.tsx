import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StatusBar,
  BackHandler,
  Platform,
  Linking,
  RefreshControl,
  Dimensions,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import {
  WebViewErrorEvent,
  ShouldStartLoadRequest,
  WebViewMessageEvent,
  WebViewProgressEvent,
  FileDownloadEvent
} from 'react-native-webview/src/WebViewTypes';
import MessageBox from './MessageBox';
import { URL, COLOR_DARK_MAIN } from './constants'
import LoadingAnimation from './LoadingAnimation';
import { injectedJavaScript } from './pageEnhancement'
import ErrorScreen from './ErrorScreen'
// import { ScrollView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RNFetchBlob from 'rn-fetch-blob';
import mime from 'react-native-mime-types'
import base64 from 'base64-js';
import CookieManager from '@react-native-cookies/cookies';

const styles = StyleSheet.create({
  view: { flex: 1, height: '100%' }
});


const WebDriver = () => {
  const webViewRef = useRef<WebView | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(URL);
  const [backButtonPress, setBackButtonPress] = useState<boolean>(false);
  const [height, setHeight] = useState(Dimensions.get('screen').height);

  const openDownloadedFile = useCallback(async ({ nativeEvent }: FileDownloadEvent) => {
    const { downloadUrl } = nativeEvent;
    try {
      let cookies = await CookieManager.get(URL, true)
        .then(e => Object
          .entries(e)
          .map(([key, value]) => `${value.name}=${value.value}`)
          .join('; '))

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: { cookie: cookies }
      });

      if (response.status === 200) {
        const contentType = response.headers.get('content-type') || "";
        if (contentType.includes("text/html")) {
          throw Error('Необходимв авторизация')
        }

        const contentDisposition = response.headers.get('content-disposition') || "";
        const match = /filename="?([^"]+)"?/.exec(contentDisposition);
        const fileName = match ? match[1] : 'downloadedFile';

        const extension = mime.extension(contentType) || "";
        const fullFileName = `${fileName}.${extension}`;
        const filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fullFileName}`

        const data = base64.fromByteArray(new Uint8Array(await response.arrayBuffer()));
        await RNFetchBlob.fs.writeFile(filePath, data, 'base64');

        RNFetchBlob.ios.previewDocument(filePath);
      } else {
        setError('Ошибка при скачивании файла: Неверный статус ответа');
      }

    } catch (error: any) {
      setError(`Ошибка при скачивании файла: ${error.message}`);
      webViewRef.current?.reload()
    }
  }, [])

  const onAndroidBackPress = useCallback(() => {
    if (webViewRef.current) {
      if (currentUrl !== URL) {
        // Мы не в начале
        webViewRef.current.goBack();
        return true;
      } else if (!backButtonPress) {
        setBackButtonPress(true);
        setTimeout(() => {
          setBackButtonPress(false);
        }, 3500);
        return true;
      } else {
        setBackButtonPress(false);
        // BackHandler.exitApp()
      }
    }
    return false;
  }, [backButtonPress, currentUrl]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
      };
    }
  }, [onAndroidBackPress]);


  const activeLinking = useCallback(async (url: string) => {
    return Linking.openURL(url).catch((e: Error) => setError(e.message));
  }, []);


  const onMessage = useCallback((event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    if (data.startsWith('mailto:')) {
      activeLinking(data);
    }
  }, []);

  useEffect(() => {
    if (error != "") {
      setTimeout(() => setError(""), 4000)
    }
  }, [error]);


  const handleWebViewError = useCallback((syntheticEvent: WebViewErrorEvent) => {
    const { nativeEvent } = syntheticEvent;
    const { code, description } = nativeEvent;
    console.error('WebView Error - Code:', code, 'Description:', description);
    setError(`Ошибка загрузки:\n${description}`.trim());
  }, []);

  const handleWebViewNavigationStateChange = useCallback((newNavState: WebViewNavigation) => {
    const { url, loading } = newNavState;
    setCurrentUrl(url);
    return true;
  }, []);

  const shouldStartLoadWithRequest = useCallback((event: ShouldStartLoadRequest) => {
    const { url } = event;
    if (url.startsWith(URL)) {
      setRefreshing(true)
      return true;
    }
    activeLinking(url)
    return false;
  }, []);

  const handleRefresh = useCallback(() => {
    if (webViewRef.current) {
      setRefreshing(true);
      webViewRef.current.reload();
    }
  }, []);

  const [isEnabled, setEnabled] = useState(typeof handleRefresh === 'function');

  const handleWebViewLoadEnd = useCallback(() => {
    setRefreshing(false)
    // SplashScreen.hide();
  }, []);

  const handleWebViewLoadProgress = useCallback((event: WebViewProgressEvent) => {
    const { progress } = event.nativeEvent;
    if (progress >= 0.95) {
      setRefreshing(false);
    } else {
      setRefreshing(true);
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.view}>
      <SafeAreaView style={[styles.view, { backgroundColor: COLOR_DARK_MAIN }]}>
        <StatusBar backgroundColor={COLOR_DARK_MAIN} />
        <ScrollView
          style={styles.view}
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              enabled={isEnabled}
            />
          }
        >
          <WebView
            style={[styles.view, { height }]}
            onScroll={(e) => setEnabled(
              typeof handleRefresh === 'function' &&
              e.nativeEvent.contentOffset.y === 0
            )
            }
            ref={webViewRef}
            source={{ uri: URL }}
            onFileDownload={openDownloadedFile}
            onLoadProgress={handleWebViewLoadProgress}
            onLoad={handleWebViewLoadEnd}
            domStorageEnabled={true}
            cacheEnabled={true}
            javaScriptEnabled={true}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            renderLoading={() => <LoadingAnimation />}
            allowFileAccess={true}
            autoManageStatusBarEnabled={true}
            startInLoadingState={true}
            allowsBackForwardNavigationGestures={true}
            nestedScrollEnabled={true}
            pullToRefreshEnabled={true}
            onError={handleWebViewError}
            renderError={(e) => <ErrorScreen
              errorText={e}
              action={webViewRef.current?.reload} />}
            injectedJavaScript={injectedJavaScript}
            onShouldStartLoadWithRequest={shouldStartLoadWithRequest}
            onMessage={onMessage}
          />
        </ScrollView>
        {refreshing ? <LoadingAnimation /> : null}
        <MessageBox
          message={error}
          position="top"
          type="error"
        />
        {backButtonPress ? <MessageBox
          message={'Нажмите ещё раз, чтобы выйти'}
        /> : null}
      </SafeAreaView>
    </GestureHandlerRootView >
  );
};

export default WebDriver;
