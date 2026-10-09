import { LogBox } from 'react-native';
import { registerRootComponent } from 'expo';

import App from './App';

LogBox.ignoreLogs(['InteractionManager has been deprecated']);

registerRootComponent(App);
