import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormEditorPage from './pages/FormEditorPage';
import FormFillPage from './pages/FormFillPage';
import HomePage from './pages/HomePage';
import { FormProvider } from './context/FormContext';
import SubmissionConfirmationPage from './pages/SubmissionConfirmationPage';

function App() {
  return (
    <FormProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<FormEditorPage />} />
            <Route path="/form/:formId" element={<FormFillPage />} />
            <Route path="/submission-confirmation" element={<SubmissionConfirmationPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </FormProvider>
  );
}

export default App;