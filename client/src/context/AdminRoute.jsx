import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { isLoaded, user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  const isAdmin = user?.publicMetadata?.role === 'admin'; // or use custom claim

  return isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;
