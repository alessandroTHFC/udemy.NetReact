export interface CounterState {
  data: number;
  title: string;
}

const initialState: CounterState = {
  data: 42,
  title: "YARC (Yet Another Counter Reducer)",
};

export function counterReducer(state = initialState, action: any) {
  return state;
}
