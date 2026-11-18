import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { HermesMark } from "../../ui/components/Logo";

const Splash = () => (
  <div
    className="flex h-[100dvh] items-center justify-center bg-bg"
    role="status"
    aria-label="Loading Hermes"
  >
    <HermesMark size={40} className="animate-pulse" />
  </div>
);

const Protected = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return <Splash />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;
