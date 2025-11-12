import HomePage from "../pages/HomePage";
import DetailPage from "../pages/DetailPage";
import NotFound from "../pages/NotFound";

export const routes = [
  {
    path: "/",
    component: HomePage,
    name: "home",
  },
  {
    path: "/product/:productId",
    component: DetailPage,
    name: "detail",
  },
  { path: "*", component: NotFound, name: "notfound" },
];
