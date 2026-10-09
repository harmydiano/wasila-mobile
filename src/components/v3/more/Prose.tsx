import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts, arabicText, SIZE, bodyLeading } from '../../../theme/type';
import { more } from '../../../theme/v3/colors';
import { parseMarkdown, type Block, type Inline } from '../../../utils/markdown';

function Spans({ spans, style }: { spans: Inline[]; style?: any }) {
  return (
    <Text style={style}>
      {spans.map((s, i) =>
        s.bold ? (
          <Text key={i} style={styles.bold}>
            {s.text}
          </Text>
        ) : (
          s.text
        )
      )}
    </Text>
  );
}

export default function Prose({ raw, blocks }: { raw?: string; blocks?: Block[] }) {
  const parsed = blocks ?? parseMarkdown(raw);
  if (!parsed.length) return null;
  return (
    <View style={styles.wrap}>
      {parsed.map((b, i) => {
        switch (b.kind) {
          case 'p':
            return <Spans key={i} spans={b.spans} style={styles.body} />;

          case 'quote':
            return (
              <View key={i} style={styles.quote}>
                <Spans spans={b.spans} style={styles.quoteText} />
                {!!b.attribution && <Text style={styles.attribution}>{b.attribution}</Text>}
              </View>
            );

          case 'list':
            return (
              <View key={i} style={styles.list}>
                {b.items.map((item, j) => (
                  <View key={j} style={[styles.item, item.depth > 0 && styles.itemNested]}>
                    <View style={[styles.bullet, item.depth > 0 && styles.bulletNested]} />
                    <Spans spans={item.spans} style={styles.itemText} />
                  </View>
                ))}
              </View>
            );

          case 'arabic':
            return (
              <Text key={i} style={styles.arabic} maxFontSizeMultiplier={1}>
                {b.text}
              </Text>
            );

          case 'translit':
            return (
              <Text key={i} style={styles.translit}>
                {b.text}
              </Text>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  body: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body) + 2,
    color: more.ink2,
  },
  bold: { fontFamily: fonts.bold, color: more.ink },

  quote: {
    borderLeftWidth: 2,
    borderLeftColor: more.gold,
    paddingLeft: 14,
    paddingVertical: 2,
    gap: 8,
  },
  quoteText: {
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body) + 2,
    color: more.onGoldPanel,
    fontStyle: 'italic',
  },
  attribution: { fontFamily: fonts.semibold, fontSize: SIZE.caption, color: more.meta },

  list: { gap: 8 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  itemNested: { paddingLeft: 18 },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: more.gold,
    marginTop: 9,
  },
  bulletNested: { backgroundColor: more.meta },
  itemText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: bodyLeading(SIZE.body),
    color: more.ink2,
  },

  arabic: { ...arabicText(24), color: more.onWarmHero, textAlign: 'center', marginVertical: 4 },
  translit: {
    fontFamily: fonts.regular,
    fontSize: SIZE.meta,
    lineHeight: bodyLeading(SIZE.meta),
    color: more.ink3,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
