import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const SubmissionConfirmationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <CheckCircle
          className="mx-auto mb-4 text-green-500"
          size={64}
          strokeWidth={1.5}
        />
        <h1 className="text-2xl font-bold mb-4">Test Completed</h1>
        <p className="text-gray-600 mb-6">
          Congratulations! Your responses have been recorded. You may now close
          this tab.
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default SubmissionConfirmationPage;
