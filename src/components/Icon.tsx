import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const OVERRIDES: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  ios_share: 'share',
  g_translate: 'g-translate' as any,
  phone_iphone: 'phone-iphone' as any,
  wb_twilight: 'wb-twilight' as any,
};

function toKebab(name: string) {
  return name.replace(/_/g, '-');
}

export default function Icon({
  name,
  size = 22,
  color = '#EAF3F0',
  style,
  set = 'material',
}: {
  name: string;
  size?: number;
  color?: string;
  style?: any;
  set?: 'material' | 'community';
}) {
  if (set === 'community') {
    return <MaterialCommunityIcons name={name as any} size={size} color={color} style={style} />;
  }
  const mapped = OVERRIDES[name] || (toKebab(name) as any);
  return <MaterialIcons name={mapped} size={size} color={color} style={style} />;
}
