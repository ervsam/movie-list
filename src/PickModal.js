import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Chip,
  Box,
} from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";
import CasinoIcon from "@mui/icons-material/Casino";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

function PickModal({ open, movie, onWatched, onPickAnother, onClose }) {
  if (!movie) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(160deg, #1a1a26 0%, #22142e 100%)",
          borderRadius: 3,
          border: "1px solid rgba(232, 184, 75, 0.18)",
        },
      }}
    >
      <DialogContent sx={{ textAlign: "center", pt: 5, pb: 2, px: 4 }}>
        {movie.poster_url ? (
          <Box
            component="img"
            src={movie.poster_url}
            alt={movie.title}
            sx={{
              width: 110,
              height: 165,
              objectFit: "cover",
              borderRadius: 2,
              mx: "auto",
              display: "block",
              mb: 2.5,
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            }}
          />
        ) : (
          <MovieIcon sx={{ fontSize: 44, color: "primary.main", mb: 1.5 }} />
        )}
        <Typography
          variant="overline"
          sx={{ color: "primary.main", letterSpacing: 4, display: "block", mb: 0.5 }}
        >
          Tonight's Pick
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontFamily: "Cinzel, serif", fontWeight: 700, mt: 1, mb: 1, lineHeight: 1.3 }}
        >
          {movie.title}
        </Typography>
        {(movie.year || movie.rating) && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            {movie.year}
            {movie.year && movie.rating ? " · " : ""}
            {movie.rating && `⭐ ${movie.rating}`}
          </Typography>
        )}
        <Chip
          label={movie.category.charAt(0).toUpperCase() + movie.category.slice(1)}
          size="small"
          sx={{
            background: "rgba(232, 184, 75, 0.12)",
            color: "primary.main",
            border: "1px solid rgba(232, 184, 75, 0.25)",
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          gap: 1.5,
          pb: 4,
          px: 4,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<CasinoIcon />}
          onClick={onPickAnother}
          sx={{ borderColor: "rgba(255,255,255,0.2)", color: "text.primary" }}
        >
          Pick Another
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={onWatched}
          color="primary"
          sx={{ color: "#000", fontWeight: 700 }}
        >
          Watched It!
        </Button>
        <Button
          variant="text"
          startIcon={<CloseIcon />}
          onClick={onClose}
          sx={{ color: "text.secondary" }}
        >
          Not Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PickModal;
