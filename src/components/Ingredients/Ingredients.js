import React, { useState, useEffect, useCallback, useReducer } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error("Should not get here");
  }
};

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  // const [userIngredients, setUserIngredients] = useState([]);f
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    console.log("rendering ingredients", userIngredients);
  }, [userIngredients]);

  const addIngredientHandler = ingredient => {
    setIsLoading(true);
    fetch("https://react-hooks-update-9015a.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      setIsLoading(false);
      return response.json().then(({ name }) => {
        dispatch({ type: "ADD", ingredient: { id: name, ...ingredient } });
        // setUserIngredients(prevIngredients => [
        //   ...prevIngredients,
        //   { id: name, ...ingredient }
        // ]);
      });
    });
  };

  // caches function so that it survives re-rendering functions
  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const onRemoveIngredient = e => {
    setIsLoading(true);
    fetch(
      `https://react-hooks-update-9015a.firebaseio.com/ingredients/${e}.json`,
      {
        method: "DELETE"
      }
    )
      .then(() => {
        setIsLoading(false);
        dispatch({ type: "DELETE", id: e });
        // setUserIngredients(
        //   userIngredients.filter(ingredient => ingredient.id !== e)
        // );
      })
      .catch(e => {
        setError(e.message);
      });
  };

  const clearError = () => {
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          onRemoveItem={onRemoveIngredient}
          ingredients={userIngredients}
        />
      </section>
    </div>
  );
}

export default Ingredients;
