import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface ErrorScreenProps {
    errorText: string | undefined;
    action?: () => void;
}

import { COLOR_HIGHLIGHT, FONT_BASE } from './constants';

const ErrorScreen: React.FC<ErrorScreenProps> = ({ errorText, action }) => (
    <View style={styles.container}>
        <View style={styles.innerContainer}>
            <Text style={styles.errorText}>
                {errorText}
            </Text>
            {action && <Button
                onPress={action}
                title="Reload"
                color={COLOR_HIGHLIGHT}
            />}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    errorText: {
        textAlign: 'center',
        color: 'black',
        fontSize: FONT_BASE * 3,
        marginBottom: FONT_BASE * 3,
    },
    buttonText: {
        color: 'black', // Устанавливаем цвет текста на кнопке
    },
});

export default ErrorScreen;
