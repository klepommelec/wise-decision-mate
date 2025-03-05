
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyDecisions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to homepage since decisions are now there
    navigate("/");
  }, [navigate]);

  return null;
};

export default MyDecisions;
