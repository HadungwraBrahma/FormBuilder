import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormEditorPage from './pages/FormEditorPage.jsx';
import FormFillPage from './pages/FormFillPage.jsx';
import HomePage from './pages/HomePage.jsx';
import { FormProvider } from './context/FormContext.jsx';
import SubmissionConfirmationPage from './pages/SubmissionConfirmationPage.jsx';

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