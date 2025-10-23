// src/app/not-found.js
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        fontSize: "1.5rem",
        color: "#333",
      }}
    >
      <h1>404 | Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist or has been moved.</p>
    </div>
  );
}
