import React from 'react';
import Map from './Map';
import { NavigationBar } from './components/NavigationBar';

function App() {
  return (
    <div className='w-screen h-screen overflow-hidden bg-[#020508]'>
      <NavigationBar />
      <Map />
    </div>
  );
}

export default App;
