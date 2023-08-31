import React from 'react';
import {
    ActivityIndicator
} from 'react-native';


const LoadingIndicator = () => (
    <ActivityIndicator
        color='##F1C900'
        size='large'
        style={{
            position: 'absolute', left: 20, top: 20
        }}
    />
)

export default LoadingIndicator