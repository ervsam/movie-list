import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  ThemeProvider,
  CssBaseline,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import MovieList from "./MovieList";
import PickModal from "./PickModal";
import Auth from "./Auth";
import theme from "./theme";
import { supabase } from "./supabase";

const DEFAULT_CATEGORIES = ["action", "comedy", "drama"];

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [movies, setMovies] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newCategory, setNewCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pickedMovie, setPickedMovie] = useState(null);
  const [pickModalOpen, setPickModalOpen] = useState(false);
  const [excludeIds, setExcludeIds] = useState([]);
  const [pickSource, setPickSource] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setMovies({});
      setCategories(DEFAULT_CATEGORIES);
      return;
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadData = async () => {
    const userId = session.user.id;

    const [{ data: catData }, { data: movieData }] = await Promise.all([
      supabase.from("categories").select("name").eq("user_id", userId),
      supabase
        .from("movies")
        .select("id, title, category")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
    ]);

    const savedCategories = new Set(DEFAULT_CATEGORIES);
    (catData || []).forEach(({ name }) => savedCategories.add(name));

    const allMovies = {};
    Array.from(savedCategories).forEach((c) => {
      allMovies[c] = [];
    });
    (movieData || []).forEach(({ id, title, category }) => {
      savedCategories.add(category);
      if (!allMovies[category]) allMovies[category] = [];
      allMovies[category].push({ id, title });
    });

    const catArray = Array.from(savedCategories).sort();
    catArray.forEach((c) => {
      if (!allMovies[c]) allMovies[c] = [];
    });
    setCategories(catArray);
    setMovies(allMovies);
  };

  const onMovieAdd = async (category, title) => {
    const { data, error } = await supabase
      .from("movies")
      .insert({ category, title, user_id: session.user.id })
      .select()
      .single();
    if (error) { console.error(error); return; }
    setMovies((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), { id: data.id, title }],
    }));
  };

  const onMovieDeleteById = async (category, id) => {
    const { error } = await supabase.from("movies").delete().eq("id", id);
    if (error) { console.error(error); return; }
    setMovies((prev) => ({
      ...prev,
      [category]: prev[category].filter((m) => m.id !== id),
    }));
  };

  const addCategory = async () => {
    const trimmed = newCategory.trim().toLowerCase();
    if (!trimmed || categories.includes(trimmed)) {
      setNewCategory("");
      return;
    }
    if (!DEFAULT_CATEGORIES.includes(trimmed)) {
      await supabase
        .from("categories")
        .insert({ name: trimmed, user_id: session.user.id });
    }
    setCategories((prev) => [...prev, trimmed].sort());
    setMovies((prev) => ({ ...prev, [trimmed]: [] }));
    setNewCategory("");
  };

  const deleteCategory = async (category) => {
    await Promise.all([
      supabase
        .from("movies")
        .delete()
        .eq("category", category)
        .eq("user_id", session.user.id),
      DEFAULT_CATEGORIES.includes(category)
        ? Promise.resolve()
        : supabase
            .from("categories")
            .delete()
            .eq("name", category)
            .eq("user_id", session.user.id),
    ]);
    setCategories((prev) => prev.filter((c) => c !== category));
    setMovies((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
    if (selectedCategory === category) setSelectedCategory("all");
  };

  const pickRandomFrom = useCallback(
    (source, exclude = []) => {
      const targetCats = source == null ? Object.keys(movies) : [source];
      const pool = [];
      targetCats.forEach((cat) => {
        (movies[cat] || []).forEach((m) => {
          if (!exclude.includes(m.id)) pool.push({ ...m, category: cat });
        });
      });
      if (pool.length === 0) {
        setExcludeIds([]);
        setPickModalOpen(false);
        return;
      }
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setPickedMovie(picked);
      setPickModalOpen(true);
    },
    [movies]
  );

  const handleGlobalPick = () => {
    const source = selectedCategory === "all" ? null : selectedCategory;
    setPickSource(source);
    setExcludeIds([]);
    pickRandomFrom(source, []);
  };

  const handleCategoryPick = (category) => {
    setPickSource(category);
    setExcludeIds([]);
    pickRandomFrom(category, []);
  };

  const handleWatched = () => {
    if (pickedMovie) onMovieDeleteById(pickedMovie.category, pickedMovie.id);
    setPickModalOpen(false);
    setPickedMovie(null);
    setExcludeIds([]);
  };

  const handlePickAnother = () => {
    const newExcludes = pickedMovie ? [...excludeIds, pickedMovie.id] : excludeIds;
    setExcludeIds(newExcludes);
    setPickedMovie(null);
    pickRandomFrom(pickSource, newExcludes);
  };

  const handlePickClose = () => {
    setPickModalOpen(false);
    setPickedMovie(null);
    setExcludeIds([]);
  };

  if (loadingAuth) return null;

  if (!session) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Auth />
      </ThemeProvider>
    );
  }

  const totalCount = Object.values(movies).reduce((sum, arr) => sum + arr.length, 0);
  const displayCategories = selectedCategory === "all" ? categories : [selectedCategory];

  const filteredMovies = {};
  displayCategories.forEach((cat) => {
    const catMovies = movies[cat] || [];
    filteredMovies[cat] = searchQuery.trim()
      ? catMovies.filter((m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : catMovies;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ pb: 8 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", py: 5, position: "relative" }}>
          <Tooltip title="Sign out">
            <IconButton
              onClick={() => supabase.auth.signOut()}
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "text.secondary",
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h3"
            sx={{ fontFamily: "Cinzel, serif", fontWeight: 700, color: "primary.main" }}
          >
            My Movie Queue
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            {totalCount} {totalCount === 1 ? "movie" : "movies"} saved
          </Typography>
        </Box>

        {/* Controls row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder="Search movies…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 160 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 155 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  {movies[cat] ? ` (${movies[cat].length})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<CasinoIcon />}
            onClick={handleGlobalPick}
            disabled={totalCount === 0}
            sx={{ color: "#000", px: 2.5, whiteSpace: "nowrap" }}
          >
            Pick Random
          </Button>
        </Box>

        {/* Add category row */}
        <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
          <TextField
            placeholder="New category…"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCategory()}
            size="small"
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addCategory}
            sx={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "text.primary",
              whiteSpace: "nowrap",
            }}
          >
            Add Category
          </Button>
        </Box>

        {/* Movie lists */}
        {displayCategories.map((cat) => (
          <MovieList
            key={cat}
            category={cat}
            movies={filteredMovies[cat] || []}
            onMovieAdd={onMovieAdd}
            onMovieDelete={onMovieDeleteById}
            onPickRandom={() => handleCategoryPick(cat)}
            onDeleteCategory={
              DEFAULT_CATEGORIES.includes(cat) ? undefined : () => deleteCategory(cat)
            }
          />
        ))}
      </Container>

      <PickModal
        open={pickModalOpen}
        movie={pickedMovie}
        onWatched={handleWatched}
        onPickAnother={handlePickAnother}
        onClose={handlePickClose}
      />
    </ThemeProvider>
  );
}

export default App;
