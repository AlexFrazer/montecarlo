import { assoc, assocPath, prop, sortBy } from "ramda";
import { useEffect, useReducer } from "react";

export type StateCode =
  | "AL"
  | "AK"
  | "AZ"
  | "AR"
  | "CA"
  | "CO"
  | "CT"
  | "DE"
  | "FL"
  | "GA"
  | "HI"
  | "ID"
  | "IL"
  | "IN"
  | "IA"
  | "KS"
  | "KY"
  | "LA"
  | "ME"
  | "MD"
  | "MA"
  | "MI"
  | "MN"
  | "MS"
  | "MO"
  | "MT"
  | "NE"
  | "NV"
  | "NH"
  | "NJ"
  | "NM"
  | "NY"
  | "NC"
  | "ND"
  | "OH"
  | "OK"
  | "OR"
  | "PA"
  | "RI"
  | "SC"
  | "SD"
  | "TN"
  | "TX"
  | "UT"
  | "VT"
  | "VA"
  | "WA"
  | "WV"
  | "WI"
  | "WY"
  | "DC"; // Including District of Columbia

export interface Entry {
  State: StateCode;
  Gender: "F" | "M";
  Year: number;
  Name: string;
  Rank: number;
}

export interface State {
  state: "pending" | "resolved" | "rejected";
  data: Record<StateCode, Entry[]>;
}
export function initializeStateData(): Record<StateCode, Entry[]> {
  const stateData: Record<StateCode, Entry[]> = {
    AL: [],
    AK: [],
    AZ: [],
    AR: [],
    CA: [],
    CO: [],
    CT: [],
    DE: [],
    FL: [],
    GA: [],
    HI: [],
    ID: [],
    IL: [],
    IN: [],
    IA: [],
    KS: [],
    KY: [],
    LA: [],
    ME: [],
    MD: [],
    MA: [],
    MI: [],
    MN: [],
    MS: [],
    MO: [],
    MT: [],
    NE: [],
    NV: [],
    NH: [],
    NJ: [],
    NM: [],
    NY: [],
    NC: [],
    ND: [],
    OH: [],
    OK: [],
    OR: [],
    PA: [],
    RI: [],
    SC: [],
    SD: [],
    TN: [],
    TX: [],
    UT: [],
    VT: [],
    VA: [],
    WA: [],
    WV: [],
    WI: [],
    WY: [],
    DC: [],
  };
  return stateData;
}

type Action =
  | { type: "LOAD" }
  | { type: "SET_STATE_DATA"; payload: { state: StateCode; data: Entry[] } }
  | { type: "RESOLVED" };

const sortByRank = sortBy(prop("Rank"));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return assoc("state", "pending", state);
    case "SET_STATE_DATA":
      return assocPath(["data", action.payload.state], sortByRank(action.payload.data), state);
    case "RESOLVED":
      return assocPath(["state"], "resolved", state);
    default:
      return state;
  }
}

export default function useDataLoader() {
  const [state, dispatch] = useReducer(reducer, {
    state: "pending",
    data: initializeStateData(),
  });

  useEffect(() => {
    const promises = Object.keys(state.data).map((stateCode) => {
      return import(`../assets/data/${stateCode}.json`).then(({ default: datum }) => {
        dispatch({
          type: "SET_STATE_DATA",
          payload: { state: stateCode as StateCode, data: datum },
        });
      });
    });
    Promise.all(promises).then(() => {
      dispatch({ type: "RESOLVED" });
    });
  }, []);

  return state;
}
