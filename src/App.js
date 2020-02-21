import React, {Component} from 'react';
import {ThemeProvider} from 'styled-components';
import {theme} from './commons';
import {GitVisualisation} from './GitVisualisation';

class App extends Component {
  render() {
    return <ThemeProvider theme={theme}>
      <GitVisualisation></GitVisualisation>
    </ThemeProvider>
  };
}

export default App;
