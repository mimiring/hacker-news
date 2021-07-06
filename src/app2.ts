import Router from "./core/router";
import { NewsFeedView, NewsDetailView } from "./page/index";
import { Store } from "./types";

const store: Store = {
  currentPage: 1,
  feeds: [],
  lastPage: 0,
};

declare global {
  interface Window {
    store: Store;
  }
}

window.store = store;

const router: Router = new Router();
const newsFeedView = new NewsFeedView("root");
const newsDetailView = new NewsDetailView("root");

router.setDefaultPage(newsFeedView);

router.addRoutePath("/page/", newsFeedView);
router.addRoutePath("/show/", newsDetailView);

router.route();
