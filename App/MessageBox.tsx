import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT_BASE } from './constants'


interface MessageBoxProps {
    message: string | null;
    color?: string;
    hideCallback?: () => void;
    position?: 'top' | 'bottom';
    type?: 'error' | 'warning' | 'info' | 'misc';
}


const MessageBox: React.FC<MessageBoxProps> = ({
    message,
    hideCallback,
    color,
    position = 'bottom',
    type = 'misc'
}) => {
    const [show, setShow] = useState(false);
    const [resetTimer, setResetTimer] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const hide = () => {
        setShow(false);
        hideCallback && hideCallback();
    };

    useEffect(() => {
        if (message) {
            setShow(true);
            if (resetTimer) {
                timerRef.current && clearTimeout(timerRef.current);
                setResetTimer(false);
            }
            const timeout = setTimeout(hide, 2000 + message.length * 50);
            timerRef.current = timeout;
            return () => clearTimeout(timeout);
        } else {
            hide();
        }
    }, [message, resetTimer, hideCallback]);

    if (!show) {
        return null;
    }

    return (
        <View style={
            [
                styles.container,
                position === 'top' ? styles.topContainer : styles.bottomContainer,
                { backgroundColor: color ? color : backColorsTypes[type] },
            ]}
        >
            <Text style={[styles.text]}> {message} </Text>
        </View>
    );
};


const backColorsTypes: Record<string, React.CSSProperties['color']> = {
    error: '#E57373',
    warning: '#FFA500',
    info: '#008080',
    misc: '#696969',
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        opacity: 0.85,
        borderRadius: FONT_BASE * 2,
        padding: FONT_BASE,
        margin: FONT_BASE * 3,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 5,
    },
    topContainer: {
        top: 0,
    },
    bottomContainer: {
        bottom: 0,
    },
    text: {
        fontSize: FONT_BASE * 2,
        color: 'white',
        textAlign: 'center',
    },
});

export default MessageBox;