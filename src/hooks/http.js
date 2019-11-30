import { useReducer, useCallback } from "react";

const httpReducer = (prevHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return {
        loading: true,
        error: null,
        data: null,
        extra: null,
        identifier: action.identifier
      };

    case "RESPONSE":
      return {
        ...prevHttpState,
        loading: false,
        data: action.responseData,
        extra: action.extra
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

const useHttp = () => {
  // called whenever function calling hook gets re-rendered
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
    data: null,
    extra: null,
    identifier: null
  });

  const sendRequest = useCallback((url, method, body, extra, identifier) => {
    dispatchHttp({ type: "SEND", identifier });
    fetch(url, {
      method,
      body,
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(responseData =>
        dispatchHttp({ type: "RESPONSE", responseData, extra })
      )
      .catch(e => {
        dispatchHttp({ type: "ERROR", errorMessage: e.message });
      });
  }, []);
  return {
    isLoading: httpState.loading,
    data: httpState.data,
    error: httpState.error,
    sendRequest,
    extra: httpState.extra,
    identifier: httpState.identifier
  };
};

export default useHttp;
