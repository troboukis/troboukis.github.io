(function () {
  const tocHtml = `
    <div class="toc">
      <details class="toc-book" data-toc-book>
        <summary class="toc-book-label">Book 1 — Python Basics</summary>
        <ol>
          <li><a data-toc-path="chapters/chapter-1.html">Chapter One — The Basics</a></li>
          <li><a data-toc-path="chapters/chapter-2.html">Chapter Two — Exercises</a></li>
          <li><a data-toc-path="chapters/chapter-3.html">Chapter Three — Functions &amp; Methods</a></li>
          <li><a data-toc-path="chapters/chapter-4.html">Chapter Four — Exercises</a></li>
          <li><a data-toc-path="chapters/chapter-5.html">Chapter Five — Data Types Deep Dive</a></li>
          <li><a data-toc-path="chapters/chapter-6.html">Chapter Six — Advanced Functions &amp; Methods</a></li>
          <li><a data-toc-path="chapters/chapter-7.html">Chapter Seven — Exercises</a></li>
          <li><a data-toc-path="chapters/chapter-8.html">Chapter Eight — Comparison &amp; Boolean Operators</a></li>
          <li><a data-toc-path="chapters/chapter-9.html">Chapter Nine — Regex Basics</a></li>
          <li><a data-toc-path="chapters/chapter-10.html">Chapter Ten — Exercises</a></li>
          <li><a data-toc-path="chapters/chapter-11.html">Chapter Eleven — Reading and Writing Text Files</a></li>
          <li><a data-toc-path="chapters/chapter-12.html">Chapter Twelve — Understanding Errors</a></li>
          <li><a data-toc-path="chapters/chapter-13.html">Chapter Thirteen — Test</a></li>
        </ol>
      </details>

      <details class="toc-book" data-toc-book>
        <summary class="toc-book-label">Book 2 — The Magic World of the Terminal</summary>
        <ol>
          <li><a data-toc-path="book2/book2-chapter-1.html">Chapter One — Terminal Foundations</a></li>
          <li><a data-toc-path="book2/book2-chapter-2.html">Chapter Two — Navigating Your File System</a></li>
          <li><a data-toc-path="book2/book2-chapter-3.html">Chapter Three — Managing Files and Folders</a></li>
          <li><a data-toc-path="book2/book2-chapter-4.html">Chapter Four — Reading and Searching Files</a></li>
        </ol>
      </details>

      <details class="toc-book" data-toc-book>
        <summary class="toc-book-label">Book 3 — HTML, CSS Basics</summary>
        <ol>
          <li><a data-toc-path="book3/book3-chapter-1.html">Chapter One — The Skeleton of a Web Page</a></li>
          <li><a data-toc-path="book3/book3-chapter-2.html">Chapter Two — Text, Emphasis &amp; Quotes</a></li>
          <li><a data-toc-path="book3/book3-chapter-3.html">Chapter Three — Links &amp; Images</a></li>
          <li><a data-toc-path="book3/book3-chapter-4.html">Chapter Four — Semantic Structure</a></li>
          <li><a data-toc-path="book3/book3-chapter-5.html">Chapter Five — Introduction to CSS</a></li>
          <li><a data-toc-path="book3/book3-chapter-6.html">Chapter Six — Typography &amp; Layout</a></li>
          <li><a data-toc-path="book3/book3-chapter-7.html">Chapter Seven — Embeds &amp; iframes</a></li>
          <li><a data-toc-path="book3/book3-chapter-8.html">Chapter Eight — The Article Page</a></li>
        </ol>
      </details>

      <details class="toc-book" data-toc-book>
        <summary class="toc-book-label">Book 4 — Data Analysis with Python</summary>
        <ol>
          <li><a data-toc-path="book4/book4-chapter-1.html">Chapter One — What is pandas?</a></li>
          <li><a data-toc-path="book4/book4-chapter-2.html">Chapter Two — Exploring Your Dataset</a></li>
          <li><a data-toc-path="book4/book4-chapter-3.html">Chapter Three — Selecting Data</a></li>
          <li><a data-toc-path="book4/book4-chapter-4.html">Chapter Four — Filtering Rows</a></li>
          <li><a data-toc-path="book4/book4-chapter-5.html">Chapter Five — Summary Statistics</a></li>
          <li><a data-toc-path="book4/book4-chapter-6.html">Chapter Six — Groupby and Aggregation</a></li>
          <li><a data-toc-path="book4/book4-chapter-7.html">Chapter Seven — Sorting and New Columns</a></li>
          <li><a data-toc-path="book4/book4-chapter-8.html">Chapter Eight — Cleaning and Analysis</a></li>
          <li><a data-toc-path="book4/book4-chapter-9.html">Chapter Nine — Reading and Writing CSV Files</a></li>
        </ol>
      </details>

      <details class="toc-book" data-toc-book>
        <summary class="toc-book-label">Book 5 — Web Scraping with Python</summary>
        <ol>
          <li><a data-toc-path="book5/book5-chapter-1.html">Chapter One — What is Web Scraping?</a></li>
          <li><a data-toc-path="book5/book5-chapter-2.html">Chapter Two — Getting HTML with requests</a></li>
          <li><a data-toc-path="book5/book5-chapter-3.html">Chapter Three — Your First BeautifulSoup Object</a></li>
          <li><a data-toc-path="book5/book5-chapter-4.html">Chapter Four — find() and find_all()</a></li>
          <li><a data-toc-path="book5/book5-chapter-5.html">Chapter Five — Searching by Class and id</a></li>
          <li><a data-toc-path="book5/book5-chapter-6.html">Chapter Six — Extracting Text and Attributes</a></li>
          <li><a data-toc-path="book5/book5-chapter-7.html">Chapter Seven — From Dictionaries to DataFrames</a></li>
          <li><a data-toc-path="book5/book5-chapter-8.html">Chapter Eight — Pagination and the Full Pipeline</a></li>
          <li><a data-toc-path="book5/book5-chapter-9.html">Chapter Nine — Full Data Journalism Project</a></li>
          <li><a data-toc-path="book5/book5-chapter-10.html">Chapter Ten — Playwright — Scraping Pages That Need a Real Browser</a></li>
        </ol>
      </details>

      <details class="toc-book" data-toc-book>
        <summary class="toc-book-label">Book 6 — Working with APIs</summary>
        <ol>
          <li><a data-toc-path="book6/book6-chapter-1.html">Chapter One — What is an API?</a></li>
          <li><a data-toc-path="book6/book6-chapter-2.html">Chapter Two — Your First API Request</a></li>
          <li><a data-toc-path="book6/book6-chapter-3.html">Chapter Three — Saving PDFs to a Folder</a></li>
          <li><a data-toc-path="book6/book6-chapter-4.html">Chapter Four — Finding Hidden APIs or Files</a></li>
        </ol>
      </details>

      <details class="toc-book" data-toc-book>
        <summary class="toc-book-label">Book 7 — Data Visualisation and Maps</summary>
        <ol>
          <li><a data-toc-path="book7/book7-chapter-1.html">Chapter One — What Makes a Good Chart?</a></li>
          <li><a data-toc-path="book7/book7-chapter-2.html">Chapter Two — Why Visualise Data? / DataFrames</a></li>
          <li><a data-toc-path="book7/book7-chapter-3.html">Chapter Three — Bar Charts and Line Charts</a></li>
          <li><a data-toc-path="book7/book7-chapter-4.html">Chapter Four — Scatter Plots and Histograms</a></li>
          <li><a data-toc-path="book7/book7-chapter-5.html">Chapter Five — Geographic Data and Maps</a></li>
        </ol>
      </details>

      <div class="toc-book toc-book--soon">
        <p class="toc-book-label">Book 8 — JavaScript and D3 Basics</p>
        <p class="toc-book-soon">Coming soon</p>
      </div>

      <div class="toc-book toc-book--soon">
        <p class="toc-book-label">Book 9 — Building and Publishing Your Web App</p>
        <p class="toc-book-soon">Coming soon</p>
      </div>

      <form class="toc-search" action="search.html" method="get">
        <input class="toc-search-input" type="search" name="q" placeholder="Search all content…" autocomplete="off" />
      </form>
    </div>
  `;

  function pagePath() {
    const parts = location.pathname.split("/").filter(Boolean);
    const rootIndex = parts.lastIndexOf("python-for-all");
    const siteParts = rootIndex >= 0 ? parts.slice(rootIndex + 1) : parts.slice(-2);
    const path = siteParts.join("/");
    return path || "index.html";
  }

  function linkPrefix(currentPath) {
    return currentPath.includes("/") ? "../" : "";
  }

  function mountToc(nav) {
    const currentPath = pagePath();
    const prefix = linkPrefix(currentPath);

    nav.innerHTML = tocHtml;

    const toc = nav.querySelector(".toc");
    const search = toc.querySelector(".toc-search");
    if (currentPath === "index.html") {
      search.action = prefix + "search.html";
    } else {
      search.remove();
    }

    toc.querySelectorAll("a[data-toc-path]").forEach((link) => {
      const target = link.dataset.tocPath;
      link.href = prefix + target;

      if (target === currentPath) {
        link.classList.add("is-current");
        const book = link.closest("[data-toc-book]");
        if (book) book.open = true;
      }
    });

    if (toc.querySelector("details.toc-book[open]")) {
      toc.classList.add("toc--chapter-page");
      const btn = document.createElement("button");
      btn.className = "toc-browse-btn";
      btn.type = "button";
      btn.textContent = "All books →";
      btn.addEventListener("click", () => {
        const expanded = toc.classList.toggle("toc--expanded");
        btn.textContent = expanded ? "← Current book" : "All books →";
      });
      toc.appendChild(btn);
    }
  }

  document.querySelectorAll("nav[data-shared-toc]").forEach(mountToc);
})();
