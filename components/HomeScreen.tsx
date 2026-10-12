import type { User } from '@supabase/supabase-js';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { AppHeader } from './AppHeader';
import { MealIcon } from './MealIcon';

const benefits = [
  { number: '01', title: 'Menos olvidos', text: 'Anota lo que hace falta y marca lo que ya compraste.' },
  { number: '02', title: 'Una semana más clara', text: 'Decide tus almuerzos con tiempo y consulta tu menú cuando lo necesites.' },
  { number: '03', title: 'Todo a mano', text: 'Tu lista y tu menú, en un mismo lugar y a tu ritmo.' },
];

function HomeLink({ href, label, outline = false }: { href: '/lista' | '/menu' | '/login'; label: string; outline?: boolean }) {
  return <Link href={href} asChild><Pressable accessibilityRole="link"
    style={StyleSheet.flatten([styles.link, outline && styles.outline])}>
    <Text style={styles.linkText}>{label}</Text>
  </Pressable></Link>;
}

export function HomeScreen({ user }: { user: User | null }) {
  const wide = useWindowDimensions().width >= 850;
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <AppHeader user={user} />
        <View style={[styles.hero, wide && styles.heroWide]}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>BIENVENIDO A GOODEATS</Text>
            <Text accessibilityRole="header" style={[styles.heading, wide && styles.headingWide]}>Menos vueltas.{ '\n' }<Text style={styles.yellow}>Más buenas comidas.</Text></Text>
            <Text style={styles.subtitle}>Organiza tus compras y planea tus almuerzos. Dale un poco de orden a tu semana y disfruta de cocinar.</Text>
            <View style={styles.heroActions}>
              <HomeLink href="/lista" label="Crear mi lista" />
              <HomeLink href="/menu" label="Planear mi menú" outline />
            </View>
            <Text style={styles.small}>Puedes empezar sin crear una cuenta.</Text>
          </View>
          <View style={[styles.preview, wide && styles.previewWide]}>
            <View style={styles.previewHeader}><Text style={styles.previewKicker}>UNA SEMANA CON ORDEN</Text><MealIcon color={colors.primaryDark} /></View>
            <Text style={styles.previewTitle}>¿Qué cocinamos?</Text>
            <View style={styles.exampleMeal}><Text style={styles.day}>LUNES · ALMUERZO</Text><Text style={styles.dish}>Porotos con riendas</Text></View>
            <View style={styles.exampleMeal}><Text style={styles.day}>MARTES · ALMUERZO</Text><Text style={styles.dish}>Tortilla con ensalada</Text></View>
            <Text style={styles.previewListTitle}>Y para la compra…</Text>
            <View style={styles.previewRow}><Text style={styles.previewCheck}>✓</Text><Text style={styles.previewItem}>Porotos</Text><Text style={styles.quantity}>1 kg</Text></View>
            <View style={styles.previewRow}><View style={styles.emptyCheck} /><Text style={styles.previewItem}>Tomates</Text><Text style={styles.quantity}>4 unidades</Text></View>
            <Text style={styles.exampleNote}>Un ejemplo de cómo puedes organizarte.</Text>
          </View>
        </View>
        <View style={[styles.benefits, wide && styles.benefitsWide]}>{benefits.map(benefit => <View key={benefit.number} style={styles.benefit}>
          <Text style={styles.number}>{benefit.number}</Text>
          <Text style={styles.benefitTitle}>{benefit.title}</Text>
          <Text style={styles.body}>{benefit.text}</Text>
        </View>)}</View>
        <View style={styles.sectionIntro}><Text style={styles.kicker}>ELIGE POR DÓNDE EMPEZAR</Text>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Dos maneras de organizar tu cocina</Text>
        </View>
        <View style={[styles.options, wide && styles.optionsWide]}>
          <View style={styles.option}>
            <View style={styles.optionTop}><Text style={styles.optionNumber}>01 / COMPRAS</Text><Text style={styles.optionSymbol}>＋</Text></View>
            <Text accessibilityRole="header" style={styles.optionTitle}>Mi lista</Text>
            <Text style={styles.body}>Todo lo que necesitas comprar, en una lista fácil de revisar.</Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ Agrega productos, cantidades y unidades.</Text>
              <Text style={styles.feature}>✓ Edita desde la misma fila.</Text>
              <Text style={styles.feature}>✓ Marca comprados y limpia tu lista.</Text>
            </View>
            <Text style={styles.storageNote}>Sin sesión se guarda en este dispositivo. Con tu cuenta puedes guardar listas en la nube.</Text>
            <HomeLink href="/lista" label="Abrir Mi lista" />
          </View>
          <View style={[styles.option, styles.menuOption]}>
            <View style={styles.optionTop}><Text style={styles.optionNumber}>02 / SEMANA</Text><MealIcon color={colors.primaryDark} /></View>
            <Text accessibilityRole="header" style={styles.optionTitle}>Mi menú</Text>
            <Text style={styles.body}>Resuelve qué prepararás para el almuerzo, de lunes a domingo.</Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ Escribe un almuerzo para cada día.</Text>
              <Text style={styles.feature}>✓ Cambia de semana desde el calendario.</Text>
              <Text style={styles.feature}>✓ Identifica los días con platos guardados.</Text>
            </View>
            <Text style={styles.storageNote}>Tu menú se guarda en este dispositivo. Puedes volver y cambiar tus platos cuando quieras.</Text>
            <HomeLink href="/menu" label="Abrir Mi menú" />
          </View>
        </View>
        <View style={[styles.account, wide && styles.accountWide]}>
          <View style={styles.accountCopy}><Text style={styles.accountTitle}>{user ? 'Tu cuenta, siempre a mano' : 'Lleva tu lista a otros dispositivos'}</Text>
            <Text style={styles.body}>{user ? 'Gestiona tu sesión y vuelve a tus listas cuando quieras.' : 'Crea una cuenta o inicia sesión para guardar tus listas de compras en la nube.'}</Text></View>
          <HomeLink href="/login" label={user ? 'Gestionar mi cuenta' : 'Acceder a mi cuenta'} />
        </View>
        <Text style={styles.footer}>Buenas comidas empiezan con un poco de organización.</Text>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center' },
  hero: { paddingTop: 36, paddingBottom: 32, gap: 28 }, heroWide: { flexDirection: 'row', alignItems: 'center', gap: 40, paddingVertical: 48 },
  heroCopy: { flex: 1, gap: 18 }, kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: colors.ink },
  heading: { fontSize: 38, lineHeight: 44, fontWeight: '800', letterSpacing: -1.3, color: colors.surface },
  headingWide: { fontSize: 54, lineHeight: 60 }, yellow: { color: colors.accent }, subtitle: { fontSize: 17, lineHeight: 26, color: colors.ink, maxWidth: 510 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, small: { fontSize: 13, color: colors.ink },
  link: { minHeight: 48, backgroundColor: colors.accent, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.ink }, linkText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  preview: { backgroundColor: colors.surface, padding: 22, borderRadius: 24, gap: 12 }, previewWide: { width: 340 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  previewKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.primaryDark }, previewTitle: { fontSize: 23, fontWeight: '700', color: colors.ink },
  exampleMeal: { backgroundColor: colors.primarySoft, padding: 12, borderRadius: 12, gap: 5 }, day: { fontSize: 10, fontWeight: '700', color: colors.primaryDark, letterSpacing: 0.7 },
  dish: { fontSize: 16, fontWeight: '600', color: colors.ink }, previewListTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 6 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, previewCheck: { width: 20, height: 20, borderRadius: 6, backgroundColor: colors.primaryDark, color: colors.surface, textAlign: 'center', fontWeight: '700' },
  emptyCheck: { width: 20, height: 20, borderWidth: 1, borderColor: colors.controlBorder, borderRadius: 6 }, previewItem: { flex: 1, fontSize: 14, color: colors.ink }, quantity: { fontSize: 12, color: colors.muted },
  exampleNote: { fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 4 },
  benefits: { backgroundColor: colors.accent, borderRadius: 22, padding: 22, gap: 24 }, benefitsWide: { flexDirection: 'row', gap: 28 },
  benefit: { flex: 1, gap: 7 }, number: { fontSize: 11, fontWeight: '700', color: colors.primaryDark }, benefitTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, lineHeight: 23, color: colors.ink },
  sectionIntro: { paddingTop: 36, paddingBottom: 20, gap: 10 }, sectionTitle: { fontSize: 26, lineHeight: 33, fontWeight: '700', color: colors.surface },
  options: { gap: 16 }, optionsWide: { flexDirection: 'row', alignItems: 'stretch' },
  option: { flex: 1, backgroundColor: colors.surface, borderRadius: 22, padding: 22, gap: 14 }, menuOption: { backgroundColor: colors.primarySoft },
  optionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, optionNumber: { fontSize: 11, letterSpacing: 1, fontWeight: '700', color: colors.primaryDark },
  optionSymbol: { fontSize: 22, color: colors.primaryDark }, optionTitle: { fontSize: 28, fontWeight: '700', color: colors.ink },
  features: { gap: 9 }, feature: { fontSize: 14, lineHeight: 22, color: colors.ink }, storageNote: { flexGrow: 1, fontSize: 12, lineHeight: 19, color: colors.muted },
  account: { marginTop: 24, borderWidth: 1, borderColor: '#FFFFFF88', borderRadius: 22, padding: 22, gap: 18 }, accountWide: { flexDirection: 'row', alignItems: 'center' },
  accountCopy: { flex: 1, gap: 7 }, accountTitle: { fontSize: 20, fontWeight: '700', color: colors.ink }, footer: { fontSize: 12, lineHeight: 19, textAlign: 'center', color: colors.ink, paddingVertical: 28 },
});
