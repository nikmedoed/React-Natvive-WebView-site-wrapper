import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  BackHandler,
  Platform,
  Linking,
  RefreshControl,
  Dimensions,
  StyleSheet
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import {
  WebViewErrorEvent,
  ShouldStartLoadRequest,
  WebViewMessageEvent
} from 'react-native-webview/src/WebViewTypes';
import MessageBox from './MessageBox';
import { URL } from './constants'
import LoadingAnimation from './LoadingAnimation';
import { injectedJavaScript } from './pageEnhancement'
import ErrorScreen from './ErrorScreen'
// import { ScrollView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

  const shouldStartLoadWithRequest = (event: ShouldStartLoadRequest) => {
    const { url } = event;
    if (url.startsWith(URL)) {
      return true;
    }
    Linking.openURL(url);
    return false;
  };

  const onMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    if (data.startsWith('mailto:')) {
      Linking.openURL(data);
    }
  };


  const handleRefresh = () => {
    console.log("rrefresh")
    setRefreshing(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const [isEnabled, setEnabled] = useState(typeof handleRefresh === 'function');


  return (
    <GestureHandlerRootView style={styles.view}>
      <View style={styles.view}>
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
      </View>
    </GestureHandlerRootView>
  );
};

export default WebDriver;
