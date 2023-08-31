import React from 'react';
import {
    ActivityIndicator
} from 'react-native';
import { COLOR_HIGHLIGHT, FONT_BASE } from './constants';


const LoadingAnimation: React.FC = () => (
    <ActivityIndicator
        color={COLOR_HIGHLIGHT}
        size='large'
        style={{
            position: 'absolute',
            left: FONT_BASE * 3,
            top: FONT_BASE * 3
        }}
    />
)

export default LoadingAnimation;
