import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { colors } from '../../constants/theme';
import { useAccount } from '../../contexts/AuthContext';

export default function HomeRoute() {
  const { user } = useAccount();
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}><AppHeader user={user} /></View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center' },
});
