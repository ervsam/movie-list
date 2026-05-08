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
} from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MovieList from "./MovieList";
import PickModal from "./PickModal";
import theme from "./theme";

const DEFAULT_CATEGORIES = ["action", "comedy", "drama"];
const DB_NAME = "movies";
const DB_VERSION = 2;

function App() {
  const [movies, setMovies] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newCategory, setNewCategory] = useState("");
  const [db, setDb] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickedMovie, setPickedMovie] = useState(null);
  const [pickModalOpen, setPickModalOpen] = useState(false);
  const [excludeIds, setExcludeIds] = useState([]);
  const [pickSource, setPickSource] = useState(null);

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Failed to open indexedDB:", event.target.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const { oldVersion } = event;

      if (oldVersion < 1) {
        const movieStore = db.createObjectStore("movies", {
          keyPath: "id",
          autoIncrement: true,
        });
        movieStore.createIndex("category", "category", { unique: false });
      }
      if (oldVersion < 2) {
        db.createObjectStore("categories", { keyPath: "name" });
      }
    };

    request.onsuccess = (event) => {
      const database = event.target.result;
      setDb(database);

      const tx = database.transaction(["categories", "movies"], "readonly");
      const catStore = tx.objectStore("categories");
      const movieStore = tx.objectStore("movies");

      const savedCategories = new Set(DEFAULT_CATEGORIES);
      const allMovies = {};
      DEFAULT_CATEGORIES.forEach((c) => { allMovies[c] = []; });

      catStore.getAll().onsuccess = (e) => {
        e.target.result.forEach(({ name }) => savedCategories.add(name));
      };

      movieStore.getAll().onsuccess = (e) => {
        e.target.result.forEach(({ id, category, title }) => {
          savedCategories.add(category);
          if (!allMovies[category]) allMovies[category] = [];
          allMovies[category].push({ id, title });
        });
      };

      tx.oncomplete = () => {
        const catArray = Array.from(savedCategories).sort();
        catArray.forEach((c) => { if (!allMovies[c]) allMovies[c] = []; });
        setCategories(catArray);
        setMovies(allMovies);
      };
    };
  }, []);

  const onMovieAdd = (category, title) => {
    if (!db) return;
    const tx = db.transaction(["movies"], "readwrite");
    const store = tx.objectStore("movies");
    const req = store.add({ category, title });
    req.onsuccess = () => {
      setMovies((prev) => ({
        ...prev,
        [category]: [...(prev[category] || []), { id: req.result, title }],
      }));
    };
  };

  const onMovieDeleteById = (category, id) => {
    if (!db) return;
    const tx = db.transaction(["movies"], "readwrite");
    tx.objectStore("movies").delete(id).onsuccess = () => {
      setMovies((prev) => ({
        ...prev,
        [category]: prev[category].filter((m) => m.id !== id),
      }));
    };
  };

  const addCategory = () => {
    const trimmed = newCategory.trim().toLowerCase();
    if (!trimmed || categories.includes(trimmed)) {
      setNewCategory("");
      return;
    }
    if (db) {
      const tx = db.transaction(["categories"], "readwrite");
      tx.objectStore("categories").add({ name: trimmed });
    }
    setCategories((prev) => [...prev, trimmed].sort());
    setMovies((prev) => ({ ...prev, [trimmed]: [] }));
    setNewCategory("");
  };

  const deleteCategory = (category) => {
    if (!db) return;
    const tx = db.transaction(["movies", "categories"], "readwrite");
    const movieStore = tx.objectStore("movies");
    const catIndex = movieStore.index("category");
    catIndex.openCursor(IDBKeyRange.only(category)).onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    if (!DEFAULT_CATEGORIES.includes(category)) {
      tx.objectStore("categories").delete(category);
    }
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

  const totalCount = Object.values(movies).reduce((sum, arr) => sum + arr.length, 0);

  const displayCategories = selectedCategory === "all" ? categories : [selectedCategory];

  const filteredMovies = {};
  displayCategories.forEach((cat) => {
    const catMovies = movies[cat] || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredMovies[cat] = catMovies.filter((m) => m.title.toLowerCase().includes(q));
    } else {
      filteredMovies[cat] = catMovies;
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ pb: 8 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", py: 5 }}>
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
            sx={{ borderColor: "rgba(255,255,255,0.2)", color: "text.primary", whiteSpace: "nowrap" }}
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
