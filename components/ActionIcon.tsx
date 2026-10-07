import Svg, { Path } from 'react-native-svg';

export function ActionIcon({ name, color }: { name: 'edit' | 'delete'; color: string }) {
  // Los trazos SVG no dependen de cargar una fuente para mostrar las acciones.
  return <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round">
    {name === 'edit' ? <Path d="M16 3a2.8 2.8 0 0 1 4 4L8 19l-5 2 2-5L16 3ZM14 5l4 4" /> :
      <Path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />}
  </Svg>;
}
