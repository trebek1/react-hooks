import React, { useMemo, useEffect, useCallback, useReducer } from "react";

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

const httpReducer = (prevHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return {
        loading: true,
        error: null
      };

    case "RESPONSE":
      return {
        ...prevHttpState,
        loading: false
      };
    case "ERROR":
      return {
        loading: false,
        error: action.errorMessage
      };
    case "CLEAR":
      return {
        ...prevHttpState,
        error: null
      };
    default:
      throw new Error("Should not be reaached");
  }
};

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null
  });

  useEffect(() => {
    console.log("rendering ingredients", userIngredients);
  }, [userIngredients]);

  const addIngredientHandler = useCallback(ingredient => {
    dispatchHttp({ type: "SEND" });
    fetch("https://react-hooks-update-9015a.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      dispatchHttp({ type: "RESPONSE" });
      return response.json().then(({ name }) => {
        dispatch({ type: "ADD", ingredient: { id: name, ...ingredient } });
      });
    });
  }, []);

  // caches function so that it survives re-rendering functions
  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const onRemoveIngredient = useCallback(e => {
    fetch(
      `https://react-hooks-update-9015a.firebaseio.com/ingredients/${e}.json`,
      {
        method: "DELETE"
      }
    )
      .then(() => {
        dispatch({ type: "DELETE", id: e });
      })
      .catch(e => {
        dispatchHttp({ type: "ERROR", errorMessage: e.message });
      });
  }, []);

  const clearError = () => {
    dispatchHttp({ type: "CLEAR" });
  };

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
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.isLoading}
      />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
