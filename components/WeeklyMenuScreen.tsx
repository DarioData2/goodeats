import type { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { useWeeklyMenu } from '../hooks/useWeeklyMenu';
import { DAYS } from '../services/menuStorage';
import { dayDate, shiftWeek, shortDate, weekStart } from '../services/menuDates';
import { AppHeader } from './AppHeader';
import { Button } from './Button';
import { MealIcon } from './MealIcon';

export function WeeklyMenuScreen({ user }: { user: User | null }) {
  const [week, setWeek] = useState(() => weekStart());
  return <WeekContent key={week} user={user} week={week} onWeekChange={setWeek} />;
}
function WeekContent({ user, week, onWeekChange }: { user: User | null; week: string; onWeekChange: (week: string) => void }) {
  const plan = useWeeklyMenu(user?.id ?? 'local', week);
  const total = plan.menu.filter(day => day[1].trim()).length;
  const disabled = !plan.ready || plan.loading || plan.saving;
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <AppHeader user={user} />
          <View style={styles.intro}>
            <Text style={styles.kicker}>TU SEMANA, A TU GUSTO</Text>
            <Text style={styles.heading}>Mi menú</Text>
            <Text style={styles.subtitle}>Organiza tus almuerzos de lunes a domingo.</Text>
          </View>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>{total} {total === 1 ? 'almuerzo planificado' : 'almuerzos planificados'}</Text>
            <Text style={styles.note}>Completa solo lo que necesites.</Text>
            <Text style={styles.note}>{user ? 'Tu menú se guarda en tu cuenta de Supabase.' : 'Sin sesión, el menú se guarda en este dispositivo.'}</Text>
            {user && <Button label="Actualizar desde Supabase" disabled={disabled || plan.dirty} onPress={() => void plan.reload()} />}
            {user && <Button label="Recuperar menú sin sesión" secondary disabled={disabled || plan.dirty} onPress={() => void plan.importLocal()} />}
            {user && <Text style={styles.note}>Recuperar carga el menú local como borrador. Revísalo antes de guardar y reemplazar el de esta semana.</Text>}
          </View>
          <View style={styles.calendar}>
            <View style={styles.calendarHeader}>
              <Pressable accessibilityRole="button" accessibilityLabel="Semana anterior" disabled={disabled || plan.dirty}
                onPress={() => onWeekChange(shiftWeek(week, -1))} style={styles.arrow}>
                <Text style={[styles.arrowText, (disabled || plan.dirty) && styles.dimmed]}>‹</Text>
              </Pressable>
              <View style={styles.range}><Text style={styles.label}>Semana del</Text>
                <Text style={styles.rangeText}>{shortDate(dayDate(week, 0))} – {shortDate(dayDate(week, 6))} {dayDate(week, 6).getFullYear()}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Semana siguiente" disabled={disabled || plan.dirty}
                onPress={() => onWeekChange(shiftWeek(week, 1))} style={styles.arrow}>
                <Text style={[styles.arrowText, (disabled || plan.dirty) && styles.dimmed]}>›</Text>
              </Pressable>
            </View>
            <View style={styles.calendarDays}>{DAYS.map((day, index) => {
              const planned = plan.ready && !!plan.savedMenu[index][1].trim();
              return <View key={day} accessible accessibilityLabel={`${day}, ${shortDate(dayDate(week, index))}: ${planned ? 'almuerzo guardado' : 'sin almuerzo guardado'}`}
                style={[styles.calendarDay, planned && styles.plannedDay]}>
                <Text style={[styles.calendarLabel, planned && styles.plannedText]}>{day.slice(0, 3)}</Text>
                <Text style={[styles.calendarNumber, planned && styles.plannedText]}>{dayDate(week, index).getDate()}</Text>
                <View style={styles.mealIcon}>{planned && <MealIcon color={colors.surface} />}</View>
              </View>;
            })}</View>
            {plan.dirty && <Text style={styles.note}>Guarda al final del domingo antes de cambiar de semana.</Text>}
          </View>
          {plan.error && <View style={styles.errorBox}>
            <Text accessibilityRole="alert" style={styles.error}>{plan.error}</Text>
            {!plan.ready && <Button label="Volver a cargar" disabled={plan.loading} onPress={() => void plan.reload()} />}
          </View>}
          {plan.loading ? <ActivityIndicator accessibilityLabel="Cargando menú" color={colors.ink} style={styles.loader} /> : plan.ready && <>
            <View style={styles.days}>{DAYS.map((day, dayIndex) => <View key={day} style={styles.day}>
              <View style={styles.dayHeader}><Text style={styles.dayName}>{day}</Text><Text style={styles.label}>{shortDate(dayDate(week, dayIndex))}</Text></View>
                <Text style={styles.label}>Almuerzo</Text>
                <TextInput accessibilityLabel={`Almuerzo del ${day.toLowerCase()}`} placeholder="¿Qué prepararás?"
                  placeholderTextColor={colors.muted} value={plan.menu[dayIndex][1]}
                  onChangeText={value => plan.update(dayIndex, 1, value)} editable={!disabled}
                  maxLength={240} multiline style={styles.input} />
            </View>)}</View>
            <View style={styles.footer}>
              <Button label={plan.saving ? 'Guardando…' : 'Guardar menú'} secondary disabled={disabled || !plan.dirty} onPress={() => void plan.save()} />
              {plan.dirty && <Button label="Cancelar cambios" disabled={disabled} onPress={plan.cancel} />}
              <Text accessibilityLiveRegion="polite" style={styles.note}>{plan.dirty ? 'Cambios sin guardar · pulsa Guardar menú antes de salir.' : user ? 'Menú cargado desde Supabase.' : 'Menú guardado en este dispositivo.'}</Text>
              <Text style={styles.note}>Puedes volver y cambiar tus platos cuando quieras.</Text>
            </View>
          </>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center' }, intro: { paddingVertical: 30, gap: 10 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.ink },
  heading: { fontSize: 34, fontWeight: '700', color: colors.surface, letterSpacing: -1 },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.ink },
  summary: { backgroundColor: colors.accent, borderRadius: 14, padding: 16, gap: 4, marginBottom: 18 },
  summaryText: { fontSize: 15, fontWeight: '700', color: colors.ink }, note: { fontSize: 13, lineHeight: 20, color: colors.ink },
  days: { gap: 12 }, day: { borderRadius: 18, backgroundColor: colors.surface, padding: 16, gap: 12 },
  dayName: { fontSize: 18, fontWeight: '700', color: colors.primaryDark },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calendar: { backgroundColor: colors.surface, padding: 12, borderRadius: 18, marginBottom: 18, gap: 10 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  range: { flex: 1, alignItems: 'center', gap: 4 }, rangeText: { color: colors.ink, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  arrow: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: colors.primaryDark, fontSize: 30 }, dimmed: { opacity: 0.3 },
  calendarDays: { flexDirection: 'row', gap: 4 }, calendarDay: { flex: 1, alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 10, paddingVertical: 8, gap: 4 },
  calendarLabel: { fontSize: 11, color: colors.muted }, calendarNumber: { fontSize: 16, fontWeight: '700', color: colors.ink },
  plannedDay: { backgroundColor: colors.primaryDark }, plannedText: { color: colors.surface }, mealIcon: { height: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink },
  input: { minHeight: 48, textAlignVertical: 'top', padding: 12, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, backgroundColor: colors.input, fontSize: 16, color: colors.ink },
  footer: { gap: 10, marginTop: 20, marginBottom: 16 }, loader: { padding: 40 },
  errorBox: { backgroundColor: colors.errorBackground, borderRadius: 14, padding: 16, gap: 10, marginBottom: 16 },
  error: { color: colors.danger, lineHeight: 22 },
});
