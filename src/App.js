import { useState, useEffect } from "react";
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
} from "@mui/material";
import MovieList from "./MovieList";

function App() {
  const [movies, setMovies] = useState({
    action: [],
    comedy: [],
    drama: [],
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newCategory, setNewCategory] = useState("");
  const [categoryItems, setCategoryItems] = useState([
    "action",
    "comedy",
    "drama",
  ]);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const request = indexedDB.open("movies", 1);

    request.onerror = (event) => {
      console.error("Failed to open indexedDB:", event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      setDb(db);

      // Load the data from the database and set it as the initial state
      const transaction = db.transaction("movies");
      const objectStore = transaction.objectStore("movies");

      const uniqueCategories = new Set(categoryItems);
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const category = cursor.value.category;
          uniqueCategories.add(category);
          cursor.continue();
        } else {
          const categories = {};
          uniqueCategories.forEach((category) => {
            categories[category] = [];
          });
          objectStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              const category = cursor.value.category;
              const title = cursor.value.title;
              const id = cursor.key;
              categories[category].push({ id, title });
              cursor.continue();
            } else {
              setMovies(categories);
            }
          };
        }
      };
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const objectStore = db.createObjectStore("movies", {
        keyPath: "id",
        autoIncrement: true,
      });
      objectStore.createIndex("category", "category", { unique: false });
    };
  }, [categoryItems]);

  const onMovieAdd = (category, movie) => {
    const transaction = db.transaction(["movies"], "readwrite");
    const objectStore = transaction.objectStore("movies");
    const request = objectStore.add({
      category,
      title: movie,
    });
    request.onsuccess = () => {
      setMovies((prevState) => ({
        ...prevState,
        [category]: [
          ...(prevState[category] || []), // check if prevState[category] is defined, if not set to []
          { id: request.result, title: movie },
        ],
      }));
    };
    request.onerror = (event) => {
      console.error("Failed to add movie to indexedDB:", event.target.error);
    };
  };

  const onMovieDelete = (category) => {
    const categoryMovies = movies[category];
    if (categoryMovies.length === 0) {
      console.warn("No movies in category", category);
      return null;
    }
    const randomIndex = Math.floor(Math.random() * categoryMovies.length);
    const [deletedMovie] = categoryMovies.splice(randomIndex, 1);
    const transaction = db.transaction(["movies"], "readwrite");
    const objectStore = transaction.objectStore("movies");
    const request = objectStore.delete(deletedMovie.id);
    request.onsuccess = () => {
      setMovies((prevState) => ({
        ...prevState,
        [category]: categoryMovies,
      }));
    };
    request.onerror = (event) => {
      console.error(
        "Failed to delete movie from indexedDB:",
        event.target.error
      );
    };
    return deletedMovie;
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleNewCategoryChange = (event) => {
    setNewCategory(event.target.value);
  };

  const handleNewCategorySubmit = async () => {
    const newCategoryTrimmed = newCategory.trim();
    if (newCategoryTrimmed === "") {
      return;
    }
    const newCategoryLower = newCategoryTrimmed.toLowerCase();
    if (categoryItems.find((item) => item.toLowerCase() === newCategoryLower)) {
      return;
    }

    const newCategoryItems = [...categoryItems, newCategoryTrimmed].sort();

    setNewCategory("");
    setCategoryItems(newCategoryItems);
    setMovies((prevState) => ({
      ...prevState,
      [newCategoryTrimmed]: [],
    }));
  };

  let filteredMovies;
  if (selectedCategory === "all") {
    filteredMovies = movies;
  } else {
    filteredMovies = { [selectedCategory]: movies[selectedCategory] };
  }

  const categoryItemsJSX = categoryItems.map((category) => (
    <MenuItem key={category} value={category}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </MenuItem>
  ));

  return (
    <Container
      sx={{
        marginBottom: "100px",
      }}
    >
      <Typography
        variant="h3"
        align="center"
        sx={{ my: 3, fontFamily: "Cinzel" }}
      >
        My Movie Queue
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          mb: 3,
        }}
      >
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ background: "#fff", px: 1, ml: 1 }}>
            Select category
          </InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            sx={{ marginTop: "8px" }}
          >
            <MenuItem value="all">All</MenuItem>
            {categoryItemsJSX}
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <TextField
            label="Add category"
            value={newCategory}
            onChange={handleNewCategoryChange}
            sx={{ mr: 1 }}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                handleNewCategorySubmit();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleNewCategorySubmit}
            sx={{ height: "42px" }}
          >
            Add category
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {Object.keys(filteredMovies)
          .sort()
          .map((category) => {
            const movieTitles = filteredMovies[category]
              ? filteredMovies[category].map((movie) => movie.title)
              : [];
            console.log(category, movieTitles);

            return (
              <MovieList
                key={category}
                category={category}
                movies={movieTitles}
                onMovieAdd={onMovieAdd}
                onMovieDelete={onMovieDelete}
              />
            );
          })}
      </Box>
    </Container>
  );
}

export default App;
