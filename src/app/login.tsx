import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { AccountPanel } from '../../components/AccountPanel';
import { useAccount } from '../../contexts/AuthContext';
import { colors } from '../../constants/theme';
export default function LoginRoute() {
  const { user } = useAccount();
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <AppHeader user={user} accountPage />
          <View style={styles.intro}>
            <Text style={styles.title}>{user ? 'Mi cuenta' : 'Bienvenido a GoodEats'}</Text>
            <Text style={styles.subtitle}>Tu lista de compras, siempre a mano.</Text>
          </View>
          <View style={styles.form}><AccountPanel user={user} disabled={false} /></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center' }, intro: { paddingVertical: 32, gap: 10 },
  title: { fontSize: 32, fontWeight: '700', color: colors.ink }, subtitle: { color: colors.ink, fontSize: 16 },
  form: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
