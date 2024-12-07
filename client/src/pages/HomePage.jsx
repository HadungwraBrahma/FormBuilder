import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateFormClick = async () => {
    setIsLoading(true);
    try {
      /* This API call is use to wakeup the server. Since, its deployed on free servers,
       free server automatically shut down after a period of inactivity, this API helps mitigate that issue. 
       Once the application is deployed on a paid or persistent server that doesn't shut down due to inactivity, 
       this API call can be removed. ^_^ */
      const res = await axiosInstance.get("/api/wakingup");
      console.log(res);
      if (res.status === 200) {
        setIsLoading(false);
        navigate("/editor");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
      {isLoading ? (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2Icon className="w-16 h-16 text-blue-500 animate-spin" />
          </div>
          <p className="text-gray-700 max-w-md mx-auto text-lg animate-pulse">
            🌱 Waking up sleepy server from its free-tier hibernation...💤
            <br />
            Since, it&apos;s deployed on free server,
            <br />
            First loading may take some time (1-2 min)
            <br />
            Please wait...... ^_^
          </p>
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Form Craft</h1>
          <p className="mb-8 text-gray-600">
            Create, customize, and share your forms with ease
          </p>
          <button
            onClick={handleCreateFormClick}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Create New Form
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
