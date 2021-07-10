import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
import '../node_modules/nes.css/css/nes.css';
import Grid from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Grid />, document.getElementById('root'));
registerServiceWorker();
