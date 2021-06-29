const container = document.getElementById("root");
const ajax = new XMLHttpRequest();
// const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const store = {
  currentPage: 1,
  feeds: [],
  lastPage: 0,
};

function getData(url) {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function makeFeed(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

function newsFeed(pageNumber) {
  let newsFeed = store.feeds;

  const newsList = [];
  let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prevPage__}}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/{{__nextPage__}}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__newsFeed__}}        
      </div>
    </div>
  `;

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeed(getData(NEWS_URL));
    store.lastPage = Math.ceil(newsFeed.length / 10);
  }
  if (pageNumber < 1 || pageNumber > store.lastPage) {
    throw new Error("유효하지 않은 페이지입니다");
  }

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
      <div class="p-6 ${
        newsFeed[i].read ? "bg-red-500" : "bg-white"
      } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">
              ${newsFeed[i].comments_count}
            </div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
            <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
            <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
          </div>  
        </div>
      </div>    
    `);
  }

  template = template.replace("{{__newsFeed__}}", newsList.join(""));
  template = template.replace(
    "{{__prevPage__}}",
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace(
    "{{__nextPage__}}",
    store.currentPage < store.lastPage ? store.currentPage + 1 : store.lastPage
  );

  container.innerHTML = template;
}

function newsDetail(id) {
  const newsContent = getData(CONTENT_URL.replace("@id", id));
  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>
        {{__comments__}}
      </div>
    </div>
  `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  function makeComment(comments, called = 0) {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
        <div style="padding-left: ${called * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>     
      `);

      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, called + 1));
      }
    }

    return commentString.join("");
  }

  container.innerHTML = template.replace(
    "{{__comments__}}",
    makeComment(newsContent.comments)
  );
}

function errorPage(message) {
  container.innerHTML = `
  <h3>404 NOT Found</h3>
  ${message ? `<div>${message}</div>` : ""}
  `;
}

function router() {
  const routePath = location.hash;
  // location hash에 #만 들어있을 경우 빈값을 반환함

  if (routePath === "") {
    newsFeed();
  } else if (routePath.includes("#/page/")) {
    const pageNumber = Number(routePath.substr(7));
    try {
      newsFeed(pageNumber);
    } catch (error) {
      errorPage(error.message);
      console.log(error.name + ": " + error.message);
    }
  } else if (routePath.includes("#/show/")) {
    const id = location.hash.substr(7);
    try {
      newsDetail(id);
    } catch (error) {
      errorPage();
    }
  } else {
    errorPage();
  }
}

window.addEventListener("hashchange", router);
router();