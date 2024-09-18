import React from "react";
import ReactDOM from "react-dom/client";
import UnitedStatesMap from "./united-states-map";
import "tailwindcss/tailwind.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <UnitedStatesMap />
  </React.StrictMode>
);
