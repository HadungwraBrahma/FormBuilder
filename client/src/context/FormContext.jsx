import { createContext, useState, useContext } from "react";
import axiosInstance from "../api/axiosInstance";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [formQuestions, setFormQuestions] = useState([]);

  const createForm = async (formData) => {
    try {
      const formUploadData = new FormData();
      formUploadData.append("title", formData.title);

      formQuestions.forEach((question, index) => {
        if (question.content.image) {
          formUploadData.append(
            "questionImages",
            question.content.image,
            `question_${question.type}_${index}_image`
          );
        }
      });

      formUploadData.append("questions", JSON.stringify(formQuestions));

      const response = await axiosInstance.post("/api/forms", formUploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setForms([...forms, response.data]);
      setCurrentForm(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating form:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const updateFormQuestion = (index, questionData) => {
    const updatedQuestions = [...formQuestions];
    updatedQuestions[index] = questionData;
    setFormQuestions(updatedQuestions);
  };

  const fetchForms = async () => {
    try {
      const response = await axiosInstance.get("/api/forms");
      setForms(response.data);
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const submitFormResponse = async (formId, responses) => {
    try {
      const response = await axiosInstance.post("/api/responses", {
        formId,
        responses,
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const updateForm = async (formId, formData) => {
    try {
      const formUploadData = new FormData();
      formUploadData.append("title", formData.title);

      formQuestions.forEach((question, index) => {
        if (question.content.image) {
          formUploadData.append(
            "questionImages",
            question.content.image,
            `question_${question.type}_${index}_image`
          );
        }
      });

      formUploadData.append("questions", JSON.stringify(formQuestions));

      const response = await axiosInstance.put(
        `/api/forms/${formId}`,
        formUploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setForms(
        forms.map((form) => (form._id === formId ? response.data : form))
      );

      if (currentForm?._id === formId) {
        setCurrentForm(response.data);
      }

      return response.data;
    } catch (error) {
      console.error(
        "Error updating form:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  return (
    <FormContext.Provider
      value={{
        forms,
        currentForm,
        setCurrentForm,
        createForm,
        updateForm,
        fetchForms,
        submitFormResponse,
        formQuestions,
        setFormQuestions,
        updateFormQuestion,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
