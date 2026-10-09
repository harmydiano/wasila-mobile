import { Alert } from 'react-native';
import type { PracticeState } from '../../state/AppState';
import { benefitAt } from '../../data/benefits';
import { isBegun, nightForDate } from '../../utils/practice';

export function confirmReplacePractice(
  current: PracticeState,
  onReplace: () => void,
  onKeep?: () => void
): void {
  if (!current || !isBegun(current)) {
    onReplace();
    return;
  }
  const title = benefitAt(current.catId, current.duaIdx).dua.t.replace(/ in \d+ days?$/i, '');
  const night = nightForDate(current.startedDateKey, current.totalNights, new Date());
  Alert.alert(
    'Replace your current practice?',
    `You are on day ${night} of ${current.totalNights} of “${title}”. Starting this one ends that run and its progress.`,
    [
      { text: 'Keep current', style: 'cancel', onPress: onKeep },
      { text: 'Replace', style: 'destructive', onPress: onReplace },
    ],
    { cancelable: true, onDismiss: onKeep }
  );
}
