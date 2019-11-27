import React, { useState, useEffect, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";

function Ingredients() {
  const [userIngredients, setUserIngredients] = useState([]);

  useEffect(() => {
    console.log("rendering ingredients", userIngredients);
  }, [userIngredients]);

  const addIngredientHandler = ingredient => {
    fetch("https://react-hooks-update-9015a.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
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
    fetch(
      `https://react-hooks-update-9015a.firebaseio.com/ingredients/${e}.json`,
      {
        method: "DELETE"
      }
    ).then(() => {
      setUserIngredients(
        userIngredients.filter(ingredient => ingredient.id !== e)
      );
    });
  };
  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler} />

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
