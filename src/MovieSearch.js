import { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

const POSTER_SM = "https://image.tmdb.org/t/p/w92";
const POSTER_MD = "https://image.tmdb.org/t/p/w185";
const TMDB_KEY = process.env.REACT_APP_TMDB_API_KEY;

function MovieSearch({ category, onAdd }) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = inputValue.trim();
    if (!q || q.length < 2 || !TMDB_KEY) {
      setOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&include_adult=false`
        );
        const data = await res.json();
        setOptions((data.results || []).slice(0, 7));
      } catch {
        setOptions([]);
      }
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleChange = (_event, newValue) => {
    if (!newValue) return;

    let movieData;
    if (typeof newValue === "string") {
      if (!newValue.trim()) return;
      movieData = { title: newValue.trim() };
    } else {
      const year = newValue.release_date
        ? parseInt(newValue.release_date.slice(0, 4), 10)
        : null;
      const rating =
        newValue.vote_average > 0
          ? Math.round(newValue.vote_average * 10) / 10
          : null;
      movieData = {
        title: newValue.title,
        year,
        rating,
        poster_url: newValue.poster_path ? `${POSTER_MD}${newValue.poster_path}` : null,
        tmdb_id: newValue.id,
      };
    }

    onAdd(movieData);
    setInputValue("");
    setOptions([]);
  };

  return (
    <Autocomplete
      freeSolo
      inputValue={inputValue}
      onInputChange={(_, val) => setInputValue(val)}
      onChange={handleChange}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.title)}
      isOptionEqualToValue={(opt, val) => opt.id === val?.id}
      noOptionsText={inputValue.length >= 2 ? "No results" : "Type to search…"}
      renderOption={(props, opt) => {
        const { key, ...rest } = props;
        return (
          <Box
            component="li"
            key={key}
            {...rest}
            sx={{ display: "flex", gap: 1.5, alignItems: "center", py: "6px !important" }}
          >
            {opt.poster_path ? (
              <Box
                component="img"
                src={`${POSTER_SM}${opt.poster_path}`}
                alt={opt.title}
                sx={{
                  width: 30,
                  height: 45,
                  objectFit: "cover",
                  borderRadius: 0.5,
                  flexShrink: 0,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 30,
                  height: 45,
                  bgcolor: "rgba(255,255,255,0.06)",
                  borderRadius: 0.5,
                  flexShrink: 0,
                }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                {opt.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {opt.release_date?.slice(0, 4)}
                {opt.vote_average > 0 &&
                  ` · ⭐ ${Math.round(opt.vote_average * 10) / 10}`}
              </Typography>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={
            TMDB_KEY ? `Search to add to ${category}…` : `Add to ${category}…`
          }
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={14} sx={{ mr: 0.5 }} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          },
        },
      }}
      sx={{ flex: 1 }}
    />
  );
}

export default MovieSearch;
