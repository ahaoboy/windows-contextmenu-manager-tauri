import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@ant-design/v5-patch-for-react-19";
import "./i18n";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
