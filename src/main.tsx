import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, theme } from "antd";
import "./i18n";
const { defaultAlgorithm, darkAlgorithm } = theme;
const isDark = globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ConfigProvider
      theme={{ algorithm: isDark ? darkAlgorithm : defaultAlgorithm }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
