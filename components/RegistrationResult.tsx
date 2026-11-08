import { Modal, StyleSheet, Text, View } from 'react-native';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';
import { Button } from './Button';
import { Heading } from './Heading';

type Props = {
  title: string;
  message: string;
  onClose: () => void;
  onSignIn?: () => void;
};

export function RegistrationResult({ title, message, onClose, onSignIn }: Props) {
  const { styles } = useStyles();

  return <Modal transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View accessibilityViewIsModal style={styles.card}>
        <View accessibilityRole="alert" style={styles.copy}>
          <Heading level={2} style={styles.title}>{title}</Heading>
          <Text style={styles.message}>{message}</Text>
        </View>
        {onSignIn && <Button label="Ir a iniciar sesión" onPress={onSignIn} />}
        <Button label={onSignIn ? 'Cerrar' : 'Continuar'} secondary={!!onSignIn} onPress={onClose} />
      </View>
    </View>
  </Modal>;
}

const useStyles = createThemedStyles(colors => StyleSheet.create({
  backdrop: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlay },
  card: { width: '100%', maxWidth: 420, padding: 24, borderRadius: ui.radius.card, backgroundColor: colors.surface, gap: 12 },
  copy: { gap: 8, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink },
  message: { fontSize: 16, lineHeight: 24, color: colors.muted },
}));
