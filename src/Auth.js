import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";
import { supabase } from "./supabase";

function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ maxWidth: 380, width: "100%", mx: "auto", textAlign: "center", px: 3 }}>
        <MovieIcon sx={{ fontSize: 56, color: "primary.main", mb: 2 }} />
        <Typography
          variant="h4"
          sx={{ fontFamily: "Cinzel, serif", fontWeight: 700, color: "primary.main", mb: 1 }}
        >
          My Movie Queue
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
          Sign in to access your list from any device.
        </Typography>

        {sent ? (
          <Alert severity="success" sx={{ textAlign: "left" }}>
            Check your inbox — we sent a magic link to <strong>{email}</strong>.
          </Alert>
        ) : (
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ color: "#000", fontWeight: 700, py: 1.5 }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "#000" }} /> : "Send Magic Link"}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Auth;
