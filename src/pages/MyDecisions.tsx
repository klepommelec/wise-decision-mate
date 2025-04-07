
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyDecisions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard instead of homepage
    navigate("/dashboard");
  }, [navigate]);

  return null;
};

export default MyDecisions;
