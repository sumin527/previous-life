import { useState } from 'react';
import './App.css';
import Landing from './components/Landing';
import InputForm from './components/InputForm';
import Loading from './components/Loading';

function App() {
  const [step, setStep]           = useState('landing');
  const [resultData, setResultData] = useState(null);

  const handleFormDone = (data) => {
    setResultData(data);
    setStep('loading');
  };

  const handleLoadingDone = () => {
    setStep(resultData?.character ? 'result' : 'coming-soon');
  };

  return (
    <>
      {step === 'landing' && (
        <Landing onStart={() => setStep('form')} />
      )}
      {step === 'form' && (
        <InputForm
          onBack={() => setStep('landing')}
          onResult={handleFormDone}
          onComingSoon={handleFormDone}
        />
      )}
      {step === 'loading' && (
        <Loading onDone={handleLoadingDone} />
      )}
      {/* result / coming-soon — 다음 단계에서 추가 */}
    </>
  );
}

export default App;
