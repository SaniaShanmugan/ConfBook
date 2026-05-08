import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, user, loading }) {
  if (loading) {
    return (
      <div style={styles.loaderWrapper}>
        <p style={styles.loaderText}>Checking authentication...</p>
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const styles = {
  loaderWrapper: {
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
  },
  loaderText: {
    fontSize: "14px",
    color: "#215EF8",
    fontWeight: "600",
  },
};

export default ProtectedRoute;