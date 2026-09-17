import { useCallback, useEffect, useReducer, useRef, useState } from "react";

//응답, 페이지, 다음페이지여부, 로딩표시, 에러표시
const initialState = {
  cards: [],
  page: 1,
  hasNextPage: false,
  isLoading: true,
  error: "",
};

const ACTION = {
  RESET: "RESET",
  FIRST_PAGE_SUCCESS: "FIRST_PAGE_SUCCESS",
  NEXT_PAGE_START: "NEXT_PAGE_START",
  NEXT_PAGE_SUCCESS: "NEXT_PAGE_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
};

function reducer(state, action) {
  switch (action.type) {
    case ACTION.RESET:
      return {
        ...initialState,
        isLoading: true,
      };
    case ACTION.FIRST_PAGE_SUCCESS:
      return {
        ...state,
        cards: action.cards,
        hasNextPage: action.hasNextPage,
        isLoading: false,
        error: "",
      };
    case ACTION.NEXT_PAGE_START:
      return {
        ...state,
        isLoading: true,
        error: "",
      };
    case ACTION.NEXT_PAGE_SUCCESS:
      return {
        ...state,
        page: state.page + 1,
        cards: [...state.cards, ...action.cards],
        hasNextPage: action.hasNextPage,
        isLoading: false,
      };
    case ACTION.FETCH_ERROR: {
      return {
        ...state,
        isLoading: false,
        error: action.message,
      };
    }
  }
}

export function useInfiniteFetch(fetchPage, queryParams) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [retryCount, setRetryCount] = useState(0);
  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  const loadingRef = useRef(false);
  const requestEpochRef = useRef(0);

  //처음 실행할 때
  useEffect(() => {
    let ignore = false;
    requestEpochRef.current += 1;
    loadingRef.current = true;
    dispatch({ type: ACTION.RESET });

    (async () => {
      try {
        const result = await fetchPage({ ...queryParams, page: 1 });
        if (ignore) return;

        dispatch({
          type: ACTION.FIRST_PAGE_SUCCESS,
          cards: result.cards,
          hasNextPage: result.hasNextPage,
        });
      } catch {
        if (!ignore) dispatch({ type: ACTION.FETCH_ERROR, message: "정보를 불러오지 못했어요" });
      } finally {
        if (!ignore) loadingRef.current = false;
      }
    })();

    return () => {
      ignore = true;
      requestEpochRef.current += 1;
      loadingRef.current = false;
    };
  }, [queryParams, retryCount]);

  //다음페이지로드
  const loadNextPage = useCallback(async () => {
    if (!state.hasNextPage || loadingRef.current) return;

    const requestVersion = requestEpochRef.current;
    loadingRef.current = true;
    dispatch({ type: ACTION.NEXT_PAGE_START });

    try {
      const result = await fetchPage({ ...queryParams, page: state.page + 1 });
      if (requestVersion !== requestEpochRef.current) return;
      dispatch({
        type: ACTION.NEXT_PAGE_SUCCESS,
        cards: result.cards,
        hasNextPage: result.hasNextPage,
      });
    } catch {
      if (requestVersion === requestEpochRef.current) {
        dispatch({ type: ACTION.FETCH_ERROR, message: "불러오지 못했어요." });
      }
    } finally {
      if (requestVersion === requestEpochRef.current) {
        loadingRef.current = false;
      }
    }
  }, [state.hasNextPage, state.page, fetchPage, queryParams]);

  return {
    cards: state.cards,
    isLoading: state.isLoading,
    error: state.error,
    hasNextPage: state.hasNextPage,
    loadNextPage,
    retry,
  };
}
