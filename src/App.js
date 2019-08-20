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
        const bookName = event.target[0].value;

        await this.updateBookList(bookName);
        history.pushState(null, '', `?search=${bookName}`);
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
            let thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'http://www.placehold.it/300x300';

            bookListHtml += `<li>
                <a href="${book.volumeInfo.infoLink}" class="book" target="_blank">
                    <div class="img" style="background-image: url('${thumbnail}')"></div>
                    <div class="info">
                        <div class="name ellipsis" title="${book.volumeInfo.title}">${book.volumeInfo.title}</div>
                        <div class="authors ellipsis" title="${book.volumeInfo.authors[0]}"><span>By</span> ${book.volumeInfo.authors[0]} ${book.volumeInfo.authors.length > 1 ? ' and ' + book.volumeInfo.authors.length + ' more' : ''}</div>
                        <div class="publishing ellipsis" title="${book.volumeInfo.publisher}"><span>Publishing By</span> ${book.volumeInfo.publisher}</div>
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
        var bookName = url.searchParams.get("search");
        if (bookName) {
            await this.updateBookList(bookName);
        }

        document.getElementById('search-form').onsubmit = this.onSearch;
    }
}

export default App;