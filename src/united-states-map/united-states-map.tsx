import {
  __,
  head,
  map,
  values,
  compose,
  prop,
  uniq,
  pickBy,
  is,
  complement,
  curry,
  chain,
  remove,
  assoc,
  reduce,
  omit,
  filter,
  flatten,
  propEq,
  sortBy,
} from "ramda";
import State, { StateIcons } from "./state";
import { LayoutGroup, motion } from "framer-motion";
import useDataLoader, { Entry, StateCode } from "../data-loader";
import Filters from "./filters/filters";
import colors from "tailwindcss/colors";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import { useReducer, useCallback, useMemo } from "react";

type ColorGroups = {
  [K in keyof DefaultColors]: DefaultColors[K] extends string ? never : DefaultColors[K];
};

type RandomColors<T extends object> = {
  [K in keyof T]: ColorGroups[keyof ColorGroups][keyof ColorGroups[keyof ColorGroups]];
};

const defaultColors = omit(["black", "white", "transparent", "current", "inherit"], colors);
const options = values(
  pickBy<typeof defaultColors, ColorGroups>(complement(is(String)), defaultColors)
);
const colorOptions = chain(values, options);

// Function to get a random item from an array
const getRandomIndex = <T,>(array: T[]) => Math.floor(Math.random() * array.length);

// Maps an object to color
const assignRandomColors = curry(function getRandomColor<T extends string[]>(
  obj: T
): RandomColors<T> {
  const options = [...colorOptions];
  return reduce(
    (acc, current) => {
      const index = getRandomIndex(options);
      remove(index, 1, options);
      return assoc(current, options[index], acc);
    },
    {},
    obj
  ) as RandomColors<T>;
}) as <T extends object>(obj: T) => RandomColors<T>;

type Icons = typeof StateIcons;
type States = keyof Icons;

const getTopName = compose<[Entry[]], Entry, string>(prop("Name"), head);

const filterByYear = curry(function filterByYear(year: number, data: Entry[]) {
  return filter(propEq(year, "Year"), data);
});

// To find all the top names for a given year
const getTopNames = curry(function getTopNames(year: number, data: Record<StateCode, Entry[]>) {
  return values(
    map(
      (value) =>
        compose<[Entry[]], Entry[], Entry[], Entry, string>(
          prop("Name"),
          head,
          sortBy(prop("Rank")),
          filterByYear(year)
        )(value),
      data
    )
  );
});

interface ReducerState {
  name: string | null;
  year: number;
}

type Action = { type: "SELECT_NAME"; payload: string } | { type: "SELECT_YEAR"; payload: number };

function reducer(state: ReducerState, action: Action) {
  switch (action.type) {
    case "SELECT_NAME":
      return { ...state, name: action.payload === state.name ? null : action.payload };
    case "SELECT_YEAR":
      return assoc("year", action.payload, state);
    default:
      return state;
  }
}

function UnitedStatesMap({ data }: Pick<ReturnType<typeof useDataLoader>, "data">) {
  const [{ name, year }, dispatch] = useReducer(reducer, { name: null, year: 1910 });
  const topNames = useMemo(() => getTopNames(year, data), [year, data]);
  console.log(topNames);
  const colors = useMemo(() => assignRandomColors(topNames), [topNames]);

  const onSelectName = useCallback(
    ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SELECT_NAME", payload: currentTarget.name });
    },
    [dispatch]
  );

  const onSelectYear = useCallback(
    ({ currentTarget }: React.ChangeEvent<HTMLSelectElement>) => {
      const option = currentTarget.selectedOptions?.[0];
      if (option && Number.isSafeInteger(parseInt(option.value, 10))) {
        dispatch({ type: "SELECT_YEAR", payload: parseInt(option.value, 10) });
      }
    },
    [dispatch]
  );

  return (
    <div className="flex flex-col gap-4">
      <section className="flex max-h-screen gap-4">
        <div className="flex-1 p-20">
          <LayoutGroup>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 1000 589"
              className="h-full transition-all"
            >
              {Object.keys(StateIcons).map((state) => {
                const stateData = data[state as States];
                const topName = getTopName(stateData);
                return (
                  <State
                    year={year}
                    key={state}
                    gender="F"
                    // @ts-ignore
                    color={name ? (name === topName ? colors[topName] : "black") : colors[topName]}
                    data={data[state as States]}
                    state={state as States}
                  />
                );
              })}
            </motion.svg>
          </LayoutGroup>
        </div>
        <div className="min-w-32">
          <Filters
            legend={colors}
            year={year}
            onSelectName={onSelectName}
            selectedName={name}
            data={data}
            onSelectYear={onSelectYear}
          />
        </div>
      </section>
    </div>
  );
}

export default function () {
  const { data, state } = useDataLoader();
  if (state === "pending") {
    return <div>Loading...</div>;
  }
  if (state === "rejected") {
    return <p>Something went wrong</p>;
  }
  return <UnitedStatesMap data={data} />;
}
