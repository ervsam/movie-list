import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Collapse,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CasinoIcon from "@mui/icons-material/Casino";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function MovieList({ category, movies, onMovieAdd, onMovieDelete, onPickRandom, onDeleteCategory }) {
  const [inputValue, setInputValue] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleAdd = () => {
    const title = inputValue.trim();
    if (!title) return;
    onMovieAdd(category, title);
    setInputValue("");
    setSnackbar({ open: true, message: `"${title}" added!` });
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Box
      sx={{
        mb: 2.5,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      {/* Category header */}
      <Box
        onClick={() => setExpanded((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2.5,
          py: 1.5,
          cursor: "pointer",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
          userSelect: "none",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, fontSize: "1rem" }}>
          {capitalize(category)}
        </Typography>
        <Chip
          label={movies.length}
          size="small"
          sx={{
            bgcolor: movies.length > 0 ? "primary.main" : "rgba(255,255,255,0.08)",
            color: movies.length > 0 ? "#000" : "text.secondary",
            fontWeight: 700,
            minWidth: 30,
            height: 22,
            mr: 1,
          }}
        />
        {onDeleteCategory && (
          <Tooltip title="Delete category">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDeleteCategory(); }}
              sx={{ color: "text.secondary", mr: 0.5, "&:hover": { color: "error.main" } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {expanded ? (
          <ExpandLessIcon sx={{ color: "text.secondary", fontSize: 20 }} />
        ) : (
          <ExpandMoreIcon sx={{ color: "text.secondary", fontSize: 20 }} />
        )}
      </Box>

      <Collapse in={expanded}>
        {/* Movie list */}
        {movies.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ px: 2.5, py: 2, color: "text.secondary", fontStyle: "italic" }}
          >
            No movies yet — add one below.
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 300, overflowY: "auto" }}>
            {movies.map((movie, index) => (
              <ListItem
                key={movie.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onMovieDelete(category, movie.id)}
                    sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                }
                sx={{
                  borderBottom:
                    index < movies.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  py: 0.75,
                  pl: 2.5,
                }}
              >
                <ListItemText
                  primary={movie.title}
                  primaryTypographyProps={{ variant: "body2", sx: { pr: 4 } }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Add movie + pick random */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            px: 2.5,
            py: 1.5,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder={`Add to ${capitalize(category)}…`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            size="small"
            sx={{ flex: 1 }}
          />
          <Tooltip title="Add movie">
            <Button
              variant="contained"
              onClick={handleAdd}
              size="small"
              sx={{ color: "#000", minWidth: 36, px: 1.5 }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Pick random from this category">
            <span>
              <Button
                variant="outlined"
                onClick={onPickRandom}
                disabled={movies.length === 0}
                size="small"
                sx={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "text.primary",
                  minWidth: 36,
                  px: 1.5,
                }}
              >
                <CasinoIcon fontSize="small" />
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Collapse>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSnackbar({ open: false, message: "" })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MovieList;
