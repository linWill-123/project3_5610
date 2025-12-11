import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { ROUTES } from "../constants/routes";
import { RulesPage } from "../pages/Rules";
import { HighScoresPage } from "../pages/HighScores";
import { LoginPage } from "../pages/Login";
import { RegisterPage } from "../pages/Register";
import { HomePage } from "../pages/Home";
import { SelectionPage } from "../pages/Selection";
import { EasyGamePage } from "../pages/EasyGame";
import { NormalGamePage } from "../pages/NormalGame";
import { GamePage } from "../pages/Game";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "games",
        element: <SelectionPage />,
      },
      {
        path: "game/:gameId",
        element: <GamePage />,
      },
      {
        path: "rules",
        element: <RulesPage />,
      },
      {
        path: "scores",
        element: <HighScoresPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "games/easy",
        element: <EasyGamePage />,
      },
      {
        path: "games/normal",
        element: <NormalGamePage />,
      },
    ],
  },
]);
