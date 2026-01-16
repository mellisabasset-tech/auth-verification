import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

root.render(<App />);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.transition = "opacity 0.2s ease-out";
      requestAnimationFrame(() => {
        loader.style.opacity = "0";
        loader.addEventListener("transitionend", () => {
          loader.style.display = "none";
        }, { once: true });
      });
    }
  });
});
