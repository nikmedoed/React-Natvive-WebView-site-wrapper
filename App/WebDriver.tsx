import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  BackHandler,
  Platform,
  RefreshControl,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { WebViewErrorEvent } from 'react-native-webview/src/WebViewTypes';
import MessageBox from './MessageBox';
import { URL } from './constants'
import LoadingAnimation from './LoadingAnimation';
import { injectedJavaScript } from './pageEnhancement'
import ErrorScreen from './ErrorScreen'

const WebDriver = () => {
  const webViewRef = useRef<WebView | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(URL);
  const [backButtonPress, setBackButtonPress] = useState<boolean>(false);

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
        return false;
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


  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const { url, loading } = newNavState;
    setRefreshing(loading);
    setCurrentUrl(url);
    return true;
  };


  const handleWebViewError = (syntheticEvent: WebViewErrorEvent) => {
    const { nativeEvent } = syntheticEvent;
    const { code, description } = nativeEvent;
    console.error('WebView Error - Code:', code, 'Description:', description);
    setError(`Ошибка загрузки:\n${description}`.trim());
  };

  const handleRefresh = () => {
    console.log("rrefresh")
    setRefreshing(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };


  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: URL }}
        domStorageEnabled={true}
        cacheEnabled={true}
        javaScriptEnabled={true}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        style={{ flex: 1 }}
        renderLoading={() => <LoadingAnimation />}
        allowFileAccess={true}
        autoManageStatusBarEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        nestedScrollEnabled={true}
        pullToRefreshEnabled={true}
        onError={handleWebViewError}
        renderError={(e) => <ErrorScreen errorText={e} action={webViewRef.current?.reload} />}
        injectedJavaScript={injectedJavaScript}
      />
      {refreshing ? <LoadingAnimation /> : null}
      <MessageBox
        message={error}
        position="top"
        type="error"
      />
      {backButtonPress ? <MessageBox
        message={'Нажмите ещё раз, чтобы выйти'}
      /> : null}
    </View>
  );
};

export default WebDriver;
