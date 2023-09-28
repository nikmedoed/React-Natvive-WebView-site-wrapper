# Getting Started

This is the basic code for creating a react native WebView wrapper for your service.
Just the basic code with the necessary handlers.

## Step 1: Init project
Firstly, create a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

And install dependencies:

```bash
npm install react-native-webview react-native-gesture-handler @react-native-cookies/cookies base64-js react-native-mime-types rn-fetch-blob

# OR using Yarn
```

## Step 2: Start your Application

Copy the code from the repository and configure the `constants.js` for your service. Minimally you need to set the URL of your service:
```javascript
export const URL = 'https://...'
```

Try to run:
```bash
npm run android
npm run ios

# OR using Yarn
yarn android
yarn ios
```

## Step 3: Personalize

WebView allows you to add custom styles for display, but it doesn't always help. You can improve the display of your site by injecting scripts into the page. I place such scripts in `pageEnhancement.js`