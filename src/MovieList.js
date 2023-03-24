import { useState } from "react";
import { Alert, Button, Snackbar, TextField, Typography } from "@mui/material";

function MovieList({ category, movies, onMovieAdd, onMovieDelete }) {
  const [inputValue, setInputValue] = useState("");
  const [deletedMovie, setDeletedMovie] = useState(null);
  const [addedMovie, setAddedMovie] = useState(null); // new state variable
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleAddMovie = () => {
    if (inputValue.trim() !== "") {
      onMovieAdd(category, inputValue);
      setAddedMovie(inputValue); // set the new state variable to the movie title
      setInputValue("");
      setOpenSnackbar(true);
    }
  };

  const handleDeleteMovie = () => {
    const movieToDelete = onMovieDelete(category);
    if (movieToDelete) {
      setDeletedMovie(movieToDelete.title);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            handleAddMovie();
          }
        }}
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
      {deletedMovie && (
        <Alert icon={false} color="info" sx={{ mt: 2 }}>
          <Typography variant="h5">
            Let's watch{" "}
            {deletedMovie
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
            !
          </Typography>
        </Alert>
      )}

      {movies.length === 0 ? (
        <Typography sx={{ mt: 2 }}>That's the end of your list.</Typography>
      ) : null}
      {addedMovie && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            {`${addedMovie
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")} successfully added!`}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
}

export default MovieList;
