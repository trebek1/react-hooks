import React, { useState, useEffect, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";

function Ingredients() {
  const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        setUserIngredients(prevIngredients => [
          ...prevIngredients,
          { id: name, ...ingredient }
        ]);
      });
    });
  };

  // caches function so that it survives re-rendering functions
  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    setUserIngredients(filteredIngredients);
  }, []);

  const onRemoveIngredient = e => {
    setIsLoading(true);
    fetch(
      `https://react-hooks-update-9015a.firebaseio.com/ingredients/${e}.json`,
      {
        method: "DELETE"
      }
    ).then(() => {
      setIsLoading(false);
      setUserIngredients(
        userIngredients.filter(ingredient => ingredient.id !== e)
      );
    });
  };
  return (
    <div className="App">
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
