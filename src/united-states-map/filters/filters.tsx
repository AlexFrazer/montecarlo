import { useId, useMemo } from "react";
import { Entry, StateCode } from "../../data-loader";
import { compose, map, flatten, values, prop, uniq } from "ramda";

interface FilterProps {
  legend: Record<string, string>;
  selectedName: string | null;
  yearOptions: number[];
  year: number;
  data: Record<string, Entry[]>;
  onSelectName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectYear: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const getYearOptions = compose<
  [Record<StateCode, Entry[]>],
  Entry[][],
  Entry[],
  number[],
  number[]
>(uniq, map<Entry, number>(prop("Year")), flatten, values);

type YearSelectProps = Pick<FilterProps, "data" | "year" | "onSelectYear">;

function YearSelect({ data, year, onSelectYear }: YearSelectProps) {
  const id = useId();
  const yearOptions = useMemo(() => getYearOptions(data), [data]);
  return (
    <div role="group" className="flex flex-col gap-2">
      <label htmlFor={id}>Year</label>
      <select name="year" id={id} value={year} onChange={onSelectYear}>
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Filters({
  legend,
  onSelectName,
  onSelectYear,
  selectedName,
  data,
  year,
}: FilterProps) {
  return (
    <form className="flex flex-col gap-2 px-16 py-20">
      <YearSelect data={data} year={year} onSelectYear={onSelectYear} />
      <hr />
      {Object.entries(legend).map(([key, value]) => {
        return (
          <div key={key} className="grid cursor-pointer">
            <span
              className={`col-start-1 row-start-1`}
              style={{ color: !selectedName ? value : selectedName === key ? value : "black" }}
            >
              {key}
            </span>
            <div className="w-full h-full col-start-1 row-start-1 opacity-0">
              <input
                onChange={onSelectName}
                checked={selectedName === key}
                type="checkbox"
                name={key}
                className="w-full h-full"
              />
              <label className="sr-only" htmlFor={key}>
                {key}
              </label>
            </div>
          </div>
        );
      })}
    </form>
  );
}
