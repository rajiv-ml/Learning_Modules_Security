import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createSDKStore } from './src/app/store';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { SecurityProvider } from './src/app/providers/SecurityProvider';

const store = createSDKStore();

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SecurityProvider>
          <RootNavigator />
        </SecurityProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
