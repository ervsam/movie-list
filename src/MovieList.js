import { useState } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

function MovieList({ category, movies, onMovieAdd, onMovieDelete }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleAddMovie = () => {
    if (inputValue.trim() !== "") {
      onMovieAdd(category, inputValue);
      setInputValue("");
    }
  };

  const handleDeleteMovie = () => {
    onMovieDelete(category);
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 4 }}>
        {category[0].toUpperCase() + category.slice(1)}
      </Typography>
      <TextField
        label="Add movie"
        value={inputValue}
        onChange={handleInputChange}
        sx={{ mr: 2, mt: 2 }}
      />
      <Button variant="contained" onClick={handleAddMovie} sx={{ mt: 2 }}>
        Add
      </Button>
      <Button
        variant="contained"
        onClick={handleDeleteMovie}
        sx={{ ml: 2, mt: 2 }}
      >
        Pop
      </Button>
      {movies.length > 0 ? (
        <List sx={{ mt: 2 }}>
          {movies.map((movie, index) => (
            <ListItem key={index}>
              <ListItemText primary={movie} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography sx={{ mt: 2 }}>
          No movies added to this category yet.
        </Typography>
      )}
    </div>
  );
}

export default MovieList;
