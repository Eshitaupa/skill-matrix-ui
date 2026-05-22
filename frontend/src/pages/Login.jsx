import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // ✅ Dummy credentials
    if (email === "admin@test.com" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);

      window.location.href = "/matrix";
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Skill Matrix</h2>
        <p style={styles.subtitle}>Login to continue</p>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>

        <p style={styles.note}>
          Demo Login: admin@test.com / 1234
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f2f5f9",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: "5px",
  },
  subtitle: {
    marginBottom: "20px",
    fontSize: "14px",
    color: "#666",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  note: {
    marginTop: "10px",
    fontSize: "12px",
    color: "gray",
  },
};