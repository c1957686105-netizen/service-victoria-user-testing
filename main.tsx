import { createRoot } from "react-dom/client";
import StudyApp from "./app/study-app";
import "./app/globals.css";

createRoot(document.getElementById("root")!).render(<StudyApp />);
