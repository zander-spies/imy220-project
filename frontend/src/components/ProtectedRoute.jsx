import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute(){
    const { user, loading, authError } = useAuth();

    if (loading) {
        return <p className="py-6 text-gray-600">Checking authentication...</p>;
    }

    if (authError) {
        return <p className="py-6 text-red-600">Unable to verify authentication. Please try again.</p>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;

}

export default ProtectedRoute;