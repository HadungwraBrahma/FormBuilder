import { useState, useEffect } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { LoaderIcon } from 'lucide-react';

import ComprehensionFilling from "../components/FormFillings/ComprehensionFilling";
import CategorizeFilling from "../components/FormFillings/CategorizeFilling";
import ClozeFilling from "../components/FormFillings/ClozeFilling";

const FormFillingPage = () => {
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { formId } = useParams();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axiosInstance.get(`/api/forms/${formId}`);
        setForm(response.data);

        const initialResponses = response.data.questions?.map((question) => ({
          questionId: question._id,
          questionType: question.type,
          answer: getInitialAnswer(question),
        }));

        setResponses(initialResponses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching form:", error);
        setError("Failed to load form");
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const getInitialAnswer = (question) => {
    switch (question.type) {
      case "Categorize":
        return question.content.categories.reduce((acc, categoryName) => {
          acc[categoryName] = [];
          return acc;
        }, {});
      case "Cloze":
        return question.content.sentence
          ? new Array(
              question.content.sentence.split("[BLANK]").length - 1
            ).fill(null)
          : [];
      case "Comprehension":
        return question.content.questions.map(() => null);
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await axiosInstance.post("/api/responses", {
        formId,
        responses,
      });
      navigate("/submission-confirmation");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const updateResponse = (questionId, newAnswer) => {
    setResponses((prevResponses) =>
      prevResponses?.map((response) =>
        response.questionId === questionId
          ? { ...response, answer: newAnswer }
          : response
      )
    );
  };

  const renderQuestion = (question) => {
    const response = responses.find(
      (r) => r.questionId === question._id
    )?.answer;

    switch (question.type) {
      case "Categorize":
        return (
          <CategorizeFilling
            key={question._id}
            question={question}
            response={response}
            onResponseUpdate={(newAnswer) =>
              updateResponse(question._id, newAnswer)
            }
          />
        );
      case "Cloze":
        return (
          <ClozeFilling
            key={question._id}
            question={question}
            response={response}
            onResponseUpdate={(newAnswer) =>
              updateResponse(question._id, newAnswer)
            }
          />
        );
      case "Comprehension":
        return (
          <ComprehensionFilling
            key={question._id}
            question={question}
            response={response}
            onResponseUpdate={(newAnswer) =>
              updateResponse(question._id, newAnswer)
            }
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>No form found</div>;

  return (
    <DndContext collisionDetection={closestCorners}>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
        {form.headerImage && (
          <img
            src={form.headerImage}
            alt="Form Header"
            className="w-full h-48 object-cover mb-4"
          />
        )}
        {form.questions?.map(renderQuestion)}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`mt-4 px-4 py-2 rounded ${
            submitting 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 text-white'
          }`}
        >
          {submitting ? (
            <div className="flex items-center justify-center">
              <LoaderIcon className="mr-2 animate-spin" />
              Submitting...
            </div>
          ) : (
            'Submit Form'
          )}
        </button>
      </div>
    </DndContext>
  );
};

export default FormFillingPage;