import FormEditor from '../components/FormEditor';

const FormEditorPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg">
        <div className="p-6">
          <FormEditor />
        </div>
      </div>
    </div>
  );
};

export default FormEditorPage;