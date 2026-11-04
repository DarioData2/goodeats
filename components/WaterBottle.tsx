import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { createThemedStyles } from '../contexts/ThemeContext';
import { BOTTLE_CAPACITY_ML, bottleLevel } from '../services/hydrationLogic';

export function WaterBottle({ total, number = 1 }: { total: number; number?: number }) {
  const { styles } = useStyles();
  const ml = bottleLevel(total);
  const [level] = useState(() => new Animated.Value(ml / BOTTLE_CAPACITY_ML));
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const target = ml / BOTTLE_CAPACITY_ML;
    if (reduceMotion) { level.setValue(target); return; }
    // Height changes layout, so this short fill animation uses the JS driver.
    const animation = Animated.timing(level, { toValue: target, duration: 650, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [ml, level, reduceMotion]);
  return <View style={styles.container}>
    <Text style={styles.caption}>Botella {number}</Text>
    <View accessibilityRole="progressbar" accessibilityLabel={`Botella ${number}, capacidad un litro`} accessibilityValue={{ min: 0, max: BOTTLE_CAPACITY_ML, now: ml, text: `${ml} de 1000 ml` }} style={styles.figure}>
      <View accessible={false} style={styles.cap} />
      <View accessible={false} style={styles.neck} />
      <View accessible={false} style={styles.body}>
        <Animated.View style={[styles.water, { height: level.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        <View style={styles.shine} />
        {[20, 40, 60, 80].map(percent => <View key={percent} style={[styles.mark, { bottom: `${percent}%` }]} />)}
      </View>
    </View>
    <Text style={styles.amount}>{ml.toLocaleString('es-CL')} / 1.000 ml</Text>
    <Text style={styles.caption}>{ml === BOTTLE_CAPACITY_ML ? 'Completa' : ml ? 'En curso' : 'Por llenar'}</Text>
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  container: { width: 142, alignItems: 'center', gap: 10, paddingVertical: 12 }, figure: { width: 112, alignItems: 'center' },
  cap: { width: 48, height: 18, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: colors.primary },
  neck: { width: 36, height: 18, backgroundColor: colors.primarySoft, borderLeftWidth: 2, borderRightWidth: 2, borderColor: colors.controlBorder },
  body: { width: 112, height: 174, borderWidth: 2, borderColor: colors.controlBorder, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden', backgroundColor: colors.primarySoft },
  water: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.primary, borderTopWidth: 3, borderTopColor: colors.primaryDark },
  shine: { position: 'absolute', top: 24, left: 16, width: 8, height: 108, borderRadius: 4, backgroundColor: colors.surface, opacity: 0.35 },
  mark: { position: 'absolute', right: 0, width: 17, height: 2, backgroundColor: colors.ink, opacity: 0.4 },
  amount: { color: colors.primaryDark, fontSize: 15, fontWeight: '800' }, caption: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
}));
