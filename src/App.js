import GoogleBooks from './services/GoogleBooks';

class App {
    constructor() {
        this.onSearch = this.onSearch.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.bookList = [];
        this.Init();
    }

    /**
     * Searches for books when the form submits
     */
    async onSearch(event) {
        event.preventDefault();
        const searchType = event.target[0].value;
        const bookName = event.target[1].value;
        const searchQuery = searchType + bookName;

        await this.updateBookList(searchQuery);
        history.pushState(null, '', `?search=${searchQuery}`);
    }

    /**
     * Updates the book list array with a new list using the GoogleBooks service
     */
    async updateBookList(bookName) {
        this.renderLoading();
        try {
            this.bookList = await GoogleBooks.find(bookName);
            this.render();
        } catch (err) {
            document.getElementById("result-list").innerHTML = '<div class="error"><span>Ops! There was an error.</span></div>';
        }
    }

    /**
     * Renders the book list
     */
    render() {
        let bookListHtml = '';
        if (this.bookList.length === 0) {
            document.getElementById("result-list").innerHTML = '<div class="empty">No books found :(</div>';
            return;
        }

        this.bookList.forEach((book) => {
            const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'http://www.placehold.it/200x200/404040';
            const publisher = book.volumeInfo.publisher ? book.volumeInfo.publisher : '(no publisher found)';
            let authors = '(no author found)';
            if (book.volumeInfo.authors) {
                authors = book.volumeInfo.authors[0] + (book.volumeInfo.authors.length > 1 ? ' and ' + book.volumeInfo.authors.length + ' more' : '');
            }

            bookListHtml += `<li>
                <a href="${book.volumeInfo.infoLink}" class="book" target="_blank">
                    <div class="img" style="background-image: url('${thumbnail}')"></div>
                    <div class="info">
                        <div class="wrap">
                            <div class="name" title="${book.volumeInfo.title}">${book.volumeInfo.title}</div>
                            <div class="authors ellipsis" title="${authors}"><span>By</span> ${authors}</div>
                        </div>
                        <div class="publishing ellipsis" title="${publisher}"><span>Publishing By</span> ${publisher}</div>
                    </div>
                </a>
            </li>`;
        });

        this.resultList = document.getElementById('result-list');
        this.resultList.innerHTML = bookListHtml;
    }

    /**
     * Renders a loading message
     */
    renderLoading() {
        document.getElementById("result-list").innerHTML = '<div class="loading">Searching for books . . .</div>';
    }

    /**
     * Initializes the application
     */
    async Init() {
        const url = new URL(window.location.href);
        var searchQuery = url.searchParams.get("search");
        if (searchQuery) {
            await this.updateBookList(searchQuery);
        }

        document.getElementById('search-form').onsubmit = this.onSearch;
    }
}

export default App;