import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { fonts, serifHeading, arabicText, SIZE, CLAMP, bodyLeading, pinLeading, eyebrow } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import type { BenefitBlock, PassageBlock } from '../../types/models';
import type { BenefitTextPrefs } from '../../data/prefs';

export function translitSize(arabicSize: number) {
  return Math.max(13, Math.round(arabicSize * 0.5));
}

function Eyebrow({ label, trailing }: { label: string; trailing?: React.ReactNode }) {
  return (
    <View style={styles.eyebrowRow}>
      <Text style={styles.eyebrow}>{label}</Text>
      <View style={styles.rule} />
      {trailing}
    </View>
  );
}

function Passage({
  block,
  text,
  arabicSize,
  trailing,
}: {
  block: PassageBlock;
  text: BenefitTextPrefs;
  arabicSize: number;
  trailing?: React.ReactNode;
}) {
  const px = translitSize(arabicSize);
  const stanzas = text.splitPassage
    ? block.lines
    : [{ ar: block.lines.map((l) => l.ar).filter(Boolean).join(' '), tr: block.lines.map((l) => l.tr).filter(Boolean).join(' ') }];

  return (
    <View style={styles.group}>
      {!!block.label && <Eyebrow label={block.label} trailing={trailing} />}

      {stanzas.map((line, i) => (
        <View key={i} style={i === 0 ? styles.stanzaFirst : styles.stanza}>
          {!!line.ar && (
            <Text
              style={[styles.arabic, arabicText(arabicSize)]}
              maxFontSizeMultiplier={1}
            >
              {line.ar}
            </Text>
          )}
          {text.showTranslit && !!line.tr && (
            <Text
              style={[
                i === 0 ? styles.translitLead : styles.translit,
                { fontSize: px, lineHeight: Math.round(px * 1.65) },
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {line.tr}
            </Text>
          )}
        </View>
      ))}

      {text.showTranslation && !!block.translation && (
        <View style={styles.translationCard}>
          <Text style={styles.eyebrow}>Translation</Text>
          <Text style={styles.translation}>{block.translation}</Text>
        </View>
      )}
    </View>
  );
}

export default function BenefitBlocks({
  blocks,
  text,
  arabicSize,
  counterFor,
  passageAction,
}: {
  blocks: BenefitBlock[];
  text: BenefitTextPrefs;
  arabicSize: number;
  counterFor?: (blockIndex: number) => React.ReactNode;
  passageAction?: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'passage':
            return (
              <Passage key={i} block={block} text={text} arabicSize={arabicSize} trailing={passageAction} />
            );

          case 'prose': {
            if (!block.tone || block.tone === 'plain') {
              return (
                <View key={i} style={styles.group}>
                  {block.text.map((p, j) => (
                    <Text key={j} style={styles.lead}>
                      {p}
                    </Text>
                  ))}
                </View>
              );
            }
            const reported = block.tone === 'reported';
            return (
              <View key={i} style={[styles.proseCard, reported && styles.reportedCard]}>
                {!!block.title && (
                  <View style={styles.cardHead}>
                    {!!block.icon && (
                      <Icon name={block.icon} size={18} color={reported ? colors.gold : colors.accent} />
                    )}
                    <Text
                      style={[styles.eyebrow, reported && styles.eyebrowGold]}
                      numberOfLines={1}
                      maxFontSizeMultiplier={CLAMP}
                    >
                      {block.title}
                    </Text>
                  </View>
                )}
                {block.text.map((p, j) => (
                  <Text key={j} style={[styles.body, reported && styles.bodyGold]}>
                    {p}
                  </Text>
                ))}
              </View>
            );
          }

          case 'steps':
            return (
              <View key={i} style={styles.proseCard}>
                {!!block.title && (
                  <View style={styles.cardHead}>
                    <Icon name="format_list_numbered" size={18} color={colors.accent} />
                    <Text style={styles.eyebrow} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                      {block.title}
                    </Text>
                  </View>
                )}
                {block.items.map((step, j) => (
                  <View key={j} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNum} maxFontSizeMultiplier={1.15}>
                        {j + 1}
                      </Text>
                    </View>
                    <Text style={[styles.body, styles.stepText]}>{step}</Text>
                  </View>
                ))}
              </View>
            );

          case 'recitation':
            return (
              <View key={i} style={styles.recitation}>
                {!!block.ar?.trim() && (
                  <Text
                    style={[
                      styles.recitationArabic,
                      arabicText(arabicSize),
                    ]}
                    maxFontSizeMultiplier={1}
                  >
                    {block.ar}
                  </Text>
                )}
                {!!block.tr?.trim() && <Text style={styles.recitationTr}>{block.tr}</Text>}
                {!!block.instruction?.trim() && (
                  <Text style={styles.recitationInstruction}>{block.instruction}</Text>
                )}
                {counterFor?.(i)}
              </View>
            );

          case 'prayer':
            return (
              <View key={i} style={styles.proseCard}>
                <View style={styles.cardHead}>
                  <Icon name="mosque" size={18} color={colors.accent} />
                  <Text style={styles.eyebrow} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                    {block.title || `${block.rakat} rakʿah${block.rakat === 1 ? '' : 's'}`}
                  </Text>
                </View>
                {!!block.each?.trim() && (
                  <Text style={styles.body}>
                    {block.units?.length ? `In every rakʿah: ${block.each}` : block.each}
                  </Text>
                )}
                {(block.units ?? []).map((unit, j) => (
                  <View key={j} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNum} maxFontSizeMultiplier={1.15}>
                        {j + 1}
                      </Text>
                    </View>
                    <Text style={[styles.body, styles.stepText]}>{unit}</Text>
                  </View>
                ))}
                {!!block.note?.trim() && <Text style={styles.cardNote}>{block.note}</Text>}
              </View>
            );

          case 'writing':
            return (
              <View key={i} style={styles.proseCard}>
                <View style={styles.cardHead}>
                  <Icon name="edit" size={18} color={colors.accent} />
                  <Text style={styles.eyebrow} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                    {block.title || (block.times && block.times > 1 ? `Write it ${block.times} times` : 'What is written')}
                  </Text>
                </View>
                {!!block.text?.trim() && <Text style={styles.body}>{block.text}</Text>}
                {!!block.ar?.trim() && (
                  <Text style={[styles.arabic, arabicText(arabicSize)]} maxFontSizeMultiplier={1}>
                    {block.ar}
                  </Text>
                )}
                {!!block.tr?.trim() && text.showTranslit && (
                  <Text
                    style={[styles.translit, { fontSize: translitSize(arabicSize), lineHeight: Math.round(translitSize(arabicSize) * 1.65) }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {block.tr}
                  </Text>
                )}
                {!!block.medium?.trim() && (
                  <Text style={styles.cardNote}>{`On / with: ${block.medium}`}</Text>
                )}
                {(block.then ?? []).map((step, j) => (
                  <View key={j} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNum} maxFontSizeMultiplier={1.15}>
                        {j + 1}
                      </Text>
                    </View>
                    <Text style={[styles.body, styles.stepText]}>{step}</Text>
                  </View>
                ))}
              </View>
            );

          case 'note':
          default:
            return (
              <Text key={i} style={styles.note}>
                {block.text}
              </Text>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  group: { gap: 10 },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrow: { ...eyebrow(colors.textMuted), flexShrink: 1 },
  eyebrowGold: { color: colors.amberCardText },
  rule: { flex: 1, height: 1, backgroundColor: colors.divider },

  stanzaFirst: {
    backgroundColor: v3.accentTint, borderLeftWidth: 2, borderLeftColor: colors.accent,
    borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderTopRightRadius: 16, borderBottomRightRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16, gap: 6,
  },
  stanza: { backgroundColor: v3.surfaceCard, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, gap: 6 },
  arabic: { color: colors.textPrimary, textAlign: 'right' },
  translitLead: { fontFamily: fonts.serifMedium, color: colors.textPrimary },
  translit: { fontFamily: fonts.serifMedium, color: colors.textSecondary },

  translationCard: {
    backgroundColor: colors.bgCardMuted, borderWidth: 1, borderColor: colors.divider,
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17, gap: 11,
  },
  translation: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textSecondary },

  lead: { fontFamily: fonts.regular, fontSize: SIZE.title, lineHeight: bodyLeading(SIZE.title), color: colors.textSecondary },
  body: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: colors.textSecondary },
  bodyGold: { color: colors.amberCardText },

  proseCard: { backgroundColor: v3.surfaceCard, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17, gap: 11 },
  reportedCard: { backgroundColor: colors.amberCardBg },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  stepNum: { fontFamily: fonts.extrabold, fontSize: SIZE.caption, color: colors.onMintText },
  stepText: { flex: 1 },
  cardNote: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(19, SIZE.meta), color: colors.textMuted },

  recitation: {
    backgroundColor: v3.accentTint, borderWidth: 1, borderColor: colors.accent,
    borderRadius: 22, padding: 18, gap: 6,
  },
  recitationArabic: { color: colors.mint, textAlign: 'center' },
  recitationTr: { ...serifHeading(SIZE.title), color: colors.textPrimary, textAlign: 'center' },
  recitationInstruction: {
    fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: pinLeading(22, SIZE.body),
    color: colors.textSecondary, textAlign: 'center', marginTop: 6,
  },

  note: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: pinLeading(19, SIZE.meta), color: v3.ink3 },
});
