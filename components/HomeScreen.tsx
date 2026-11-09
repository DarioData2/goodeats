import type { User } from '@supabase/supabase-js';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';
import { useHydration } from '../hooks/useHydration';
import { usePlanner } from '../hooks/usePlanner';
import { BOTTLE_CAPACITY_ML, waterTotal } from '../services/hydrationLogic';
import { dateKey, weekStart } from '../services/menuDates';
import { generateGroceries, MEAL_SLOTS, purchaseKey } from '../services/plannerLogic';
import { formatQuantity } from '../services/quantities';
import { AppHeader } from './AppHeader';
import { Button } from './Button';
import { Heading } from './Heading';

const features = [
  { title: 'Hoy en GoodEats', description: 'Revisa tu menú del día, lo que falta comprar y tu hidratación.', available: true },
  { title: 'Modo cocina', description: 'Sigue la preparación paso a paso y usa un temporizador mientras cocinas.' },
  { title: 'Mi despensa', description: 'Registra lo que tienes y compra solo lo que falta para tu menú.', available: true },
  { title: 'Lista compartida', description: 'Organiza las compras con otra persona y ve qué productos ya compró.' },
  { title: 'Colecciones y menús reutilizables', description: 'Agrupa tus recetas favoritas y vuelve a usar una semana que te funcionó.' },
];

function HomeLink({ href, label, secondary = false }: { href: '/lista' | '/menu' | '/despensa' | '/hidratacion'; label: string; secondary?: boolean }) {
  const { styles } = useStyles();
  return <Link href={href} asChild><Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.link, secondary && styles.secondary])}>
    <Text style={[styles.linkText, secondary && styles.secondaryText]}>{label}</Text>
  </Pressable></Link>;
}

export function HomeScreen({ user }: { user: User | null }) {
  const { styles } = useStyles();
  const owner = user?.id ?? 'local';
  const planner = usePlanner(owner);
  const hydration = useHydration(owner);
  const wide = useWindowDimensions().width >= 820;
  const [openMeal, setOpenMeal] = useState<number | null>(null);
  const today = new Date();
  const week = weekStart(today);
  const plan = planner.data.weeks[week];
  const meals = plan?.[(today.getDay() + 6) % 7] ?? [];
  const purchased = new Set(planner.data.purchased[week]);
  const pending = plan ? generateGroceries(plan, planner.data.pantry).items.filter(item => !purchased.has(purchaseKey(item))).length : 0;
  const ml = waterTotal(hydration.data.days[dateKey(today)] ?? []);

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <AppHeader user={user} />
        <View style={[styles.hero, wide && styles.columns]}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>{today.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            <Heading style={styles.title}>Hoy en GoodEats</Heading>
            <Text style={styles.subtitle}>Tu menú, tus compras y lo que tienes en casa, en un solo lugar.</Text>
            <View style={styles.actions}>
              <HomeLink href="/menu" label={planner.ready && meals.some(Boolean) ? 'Abrir Mi menú' : 'Planear hoy'} />
              <HomeLink href="/despensa" label="Mi despensa" secondary />
            </View>
          </View>
          <Image source={require('../assets/home-salad.jpg')} accessibilityLabel="Ensalada con huevo y verduras" resizeMode="cover" style={[styles.photo, wide && styles.photoWide]} />
        </View>

        <View style={[styles.dashboard, wide && styles.columns]}>
          <View style={styles.card}>
            <Heading level={2} style={styles.section}>Tu menú de hoy</Heading>
            {!planner.ready && <Text style={styles.body}>{planner.error ? 'No pudimos leer tu menú.' : 'Cargando tu menú…'}</Text>}
            {planner.ready && !meals.some(Boolean) && <Text style={styles.body}>Aún no tienes comidas planificadas para hoy.</Text>}
            {planner.ready && meals.map((meal, index) => {
              if (!meal) return null;
              const slot = MEAL_SLOTS[index];
              if ('text' in meal) return <View key={slot} style={styles.meal}><Text style={styles.label}>{slot}</Text><Text style={styles.body}>{meal.text}</Text></View>;
              const expanded = openMeal === index;
              return <View key={slot} style={styles.meal}>
                <Text style={styles.label}>{slot}</Text>
                <Text style={styles.body}>{meal.recipe.title} · {formatQuantity(meal.servings)} {meal.servings === 1 ? 'porción' : 'porciones'}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`${expanded ? 'Ocultar' : 'Ver'} receta de ${meal.recipe.title}, ${slot}`} aria-expanded={expanded}
                  onPress={() => setOpenMeal(expanded ? null : index)} style={[styles.link, styles.secondary]}>
                  <Text style={[styles.linkText, styles.secondaryText]}>{expanded ? 'Ocultar receta' : 'Ver receta'}</Text>
                </Pressable>
                {expanded && <View style={styles.meal}>
                  <Text style={styles.label}>Ingredientes</Text>
                  {meal.recipe.ingredients.map((item, itemIndex) => <Text key={itemIndex} style={styles.body}>{item.name} · {formatQuantity(item.quantity * (meal.servings / meal.recipe.servings))} {item.unit}</Text>)}
                  <Text style={styles.label}>Preparación</Text><Text style={styles.body}>{meal.recipe.steps || 'Esta receta no tiene pasos guardados.'}</Text>
                </View>}
              </View>;
            })}
            {!planner.ready && !!planner.error && <Button secondary label="Volver a cargar el menú" onPress={() => void planner.reload()} />}
          </View>
          <View style={styles.summary}>
            <View style={styles.card}>
              <Heading level={2} style={styles.section}>Compras de la semana</Heading>
              <Text style={styles.body}>{planner.ready ? `${pending} ${pending === 1 ? 'ingrediente pendiente del menú' : 'ingredientes pendientes del menú'}` : planner.error ? 'Compras no disponibles por ahora.' : 'Cargando compras…'}</Text>
              <HomeLink href="/lista" label="Ver mi lista" secondary />
            </View>
            <View style={styles.card}>
              <Heading level={2} style={styles.section}>Hidratación de hoy</Heading>
              <Text style={styles.body}>{hydration.ready ? `${formatQuantity(ml)} / ${formatQuantity(hydration.data.goalMl ?? BOTTLE_CAPACITY_ML)} ml` : hydration.error ? 'No pudimos leer tu hidratación.' : 'Cargando hidratación…'}</Text>
              <HomeLink href="/hidratacion" label="Abrir Mi salud" secondary />
            </View>
          </View>
        </View>

        <View style={styles.featureSection}>
          <Heading level={2} style={styles.section}>Organiza tu cocina en cinco pasos</Heading>
          {features.map((feature, index) => <View key={feature.title} style={styles.card}>
            <View style={styles.featureHeader}>
              <Heading level={3} style={styles.featureTitle}>{index + 1}. {feature.title}</Heading>
              <Text style={[styles.status, feature.available && styles.available]}>{feature.available ? 'Disponible' : 'Próximamente'}</Text>
            </View>
            <Text style={styles.body}>{feature.description}</Text>
            {feature.title === 'Mi despensa' && <HomeLink href="/despensa" label="Abrir Mi despensa" />}
          </View>)}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const useStyles = createThemedStyles(colors => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, padding: 20 },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center', gap: 20 },
  hero: { paddingVertical: 12, gap: 20 }, heroCopy: { flex: 1, gap: 12, justifyContent: 'center' },
  columns: { flexDirection: 'row', alignItems: 'flex-start' },
  eyebrow: { fontSize: 13, fontWeight: '700', color: colors.primaryDark, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 38, lineHeight: 46, color: colors.ink }, subtitle: { fontSize: 17, lineHeight: 26, color: colors.muted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photo: { width: '100%', height: 160, borderRadius: ui.radius.card, backgroundColor: colors.accentSoft }, photoWide: { width: '43%', height: 220 },
  dashboard: { gap: 14 }, summary: { flex: 1, gap: 14 },
  card: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: ui.radius.card, padding: 18, gap: 12, backgroundColor: colors.surface },
  section: { fontSize: 21, lineHeight: 29, color: colors.ink }, label: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted }, meal: { gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  link: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: ui.radius.control, backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.primarySoft }, linkText: { fontWeight: '700', color: colors.onAccent }, secondaryText: { color: colors.primary },
  featureSection: { gap: 12, paddingTop: 8 }, featureHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' },
  featureTitle: { fontSize: 17, lineHeight: 24, color: colors.ink, flexShrink: 1 },
  status: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: ui.radius.control, backgroundColor: colors.primarySoft, color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  available: { backgroundColor: colors.accentSoft, color: colors.accentText },
}));
