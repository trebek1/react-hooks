import React, { useMemo, useEffect, useCallback, useReducer } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";
import useHttp from "../../hooks/http";

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
  const { isLoading, error, data, sendRequest, extra, identifier } = useHttp();

  useEffect(() => {
    if (!isLoading && !error && identifier === "REMOVE_INGREDIENT") {
      console.log("this is extra ", extra);
      dispatch({ type: "DELETE", id: extra });
    } else if (!isLoading && data && identifier === "ADD_INGREDIENT") {
      console.log("what is data ", data, extra);
      dispatch({
        type: "ADD",
        ingredient: {
          id: data.name,
          ...extra
        }
      });
    }
  }, [data, extra, identifier, isLoading, error]);

  const addIngredientHandler = useCallback(
    ingredient => {
      sendRequest(
        "https://react-hooks-update-9015a.firebaseio.com/ingredients.json",
        "POST",
        JSON.stringify(ingredient),
        ingredient,
        "ADD_INGREDIENT"
      );
    },
    [sendRequest]
  );

  // caches function so that it survives re-rendering functions
  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const onRemoveIngredient = useCallback(
    e => {
      sendRequest(
        `https://react-hooks-update-9015a.firebaseio.com/ingredients/${e}.json`,
        "DELETE",
        null,
        e,
        "REMOVE_INGREDIENT"
      );
    },
    [sendRequest]
  );

  const clearError = useCallback(() => {
    // dispatchHttp({ type: "CLEAR" });
  }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        onRemoveItem={onRemoveIngredient}
        ingredients={userIngredients}
      />
    );
  }, [userIngredients, onRemoveIngredient]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
