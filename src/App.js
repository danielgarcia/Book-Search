import GoogleBooks from './services/GoogleBooks';

class App {
    constructor() {
        this.onSearch = this.onSearch.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.bookList = [];
        this.Init();
    }

    async onSearch(event) {
        event.preventDefault();
        const bookName = event.target[0].value;

        await this.updateBookList(bookName);
        history.pushState(null, '', `?search=${bookName}`);
    }

    async updateBookList(bookName) {
        this.renderLoading();
        this.bookList = await GoogleBooks.find(bookName);
        this.render();
    }

    render() {
        let bookListHtml = '';
        if (this.bookList.length === 0) {
            document.getElementById("result-list").innerHTML = '<div class="empty">No books found</div>';
            return;
        }

        this.bookList.forEach((book) => {
            let thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'http://www.placehold.it/300x300';

            bookListHtml += `<li>
                <a href="${book.volumeInfo.infoLink}" class="book">
                    <div class="img" style="background-image: url('${thumbnail}')"></div>
                    <div class="name">${book.volumeInfo.title}'</div>
                </a>
            </li>`;
        });

        this.resultList = document.getElementById('result-list');
        this.resultList.innerHTML = bookListHtml;
    }

    renderLoading() {
        document.getElementById("result-list").innerHTML = '<div class="loading">Searching for books . . .</div>';
    }

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