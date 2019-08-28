import 'babel-polyfill';
import App from "./App";
import path from 'path';
import fs from 'fs';
import GoogleBooks from './services/GoogleBooks';

const html = fs.readFileSync(path.resolve('./src/index.html'), 'utf8');

const getBooks = (quantity) => {
    let books = [];

    for (let i = 1; i <= quantity; i++) {
        books.push({
            volumeInfo: {
                imageLinks: 'http://www.placehold.it/200x200',
                publisher: `test company ${i}`,
                authors: [`test person ${i}`],
                infoLink: `www.test${i}.com`,
                title: `test book ${i}`
            }
        })
    }
    return books;
}

describe('verify App...', () => {
    beforeAll(() => {
        global.window = Object.create(window);
        Object.defineProperty(window, 'location', {
            value: {
                href: 'http://localhost/',
            }
        });
    });

    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        window.location.href = 'http://localhost/';
    });

    it('can be instantiated', () => {
        let app = null;
        try {
            app = new App();
        } catch {}
        expect(app).not.toBe(null);
        expect(app.bookList.length).toBe(0);
    });

    it('Init works with no query param', async () => {
        const app = new App();
        await app.Init();
        expect(app.bookList.length).toBe(0);
    });

    it('Init works with query param', async () => {
        window.location.href = 'http://localhost/?search=test';
        const app = new App();
        const updateBookList = app.updateBookList;
        app.updateBookList = jest.fn().mockImplementation(() => Promise.resolve());

        await app.Init();
        expect(app.bookList.length).toBe(0);
        expect(app.updateBookList).toHaveBeenCalledTimes(1);
        expect(app.updateBookList).toBeCalledWith('test');
        app.updateBookList = updateBookList;
    });

    describe('can render...', () => {
        it('loading message', () => {
            const app = new App();
            app.renderLoading();
            const resultList = document.getElementById('result-list');
            expect(resultList.innerHTML).toBe('<div class="loading">Searching for books . . .</div>');
        });

        it('with no books', () => {
            const app = new App();
            app.render();
            const resultList = document.getElementById('result-list');
            expect(resultList.innerHTML).toBe('<div class="empty">No books found :(</div>');
        });

        it('with 2 books', () => {
            const app = new App();
            app.bookList = getBooks(2);
            app.render();
            const resultList = document.getElementById('result-list');
            const expectedResult = `<li>
                <a href="www.test1.com" class="book" target="_blank">
                    <div class="img" style="background-image: url('undefined')"></div>
                    <div class="info">
                        <div class="wrap">
                            <div class="name" title="test book 1">test book 1</div>
                            <div class="authors ellipsis" title="test person 1"><span>By</span> test person 1</div>
                        </div>
                        <div class="publishing ellipsis" title="test company 1"><span>Publishing By</span> test company 1</div>
                    </div>
                </a>
            </li><li>
                <a href="www.test2.com" class="book" target="_blank">
                    <div class="img" style="background-image: url('undefined')"></div>
                    <div class="info">
                        <div class="wrap">
                            <div class="name" title="test book 2">test book 2</div>
                            <div class="authors ellipsis" title="test person 2"><span>By</span> test person 2</div>
                        </div>
                        <div class="publishing ellipsis" title="test company 2"><span>Publishing By</span> test company 2</div>
                    </div>
                </a>
            </li>`;
            expect(resultList.innerHTML).toBe(expectedResult);
        });
    });

    describe('updateBookList can...', () => {
        const GoogleBooksFind = GoogleBooks.find;

        afterEach(() => {
            GoogleBooks.find = GoogleBooksFind;
        });

        it('update bookList with 10 books', async () => {
            const app = new App();
            const books = getBooks(10);

            GoogleBooks.find = jest.fn().mockImplementation(() => Promise.resolve(books));

            await app.updateBookList('test book name');

            expect(app.bookList.length).toBe(10);
            expect(app.bookList).toEqual(books);
        });


        it('can render 2 books', async () => {
            const app = new App();
            const books = getBooks(2);

            GoogleBooks.find = jest.fn().mockImplementation(() => Promise.resolve(books));

            await app.updateBookList('test book name');
            expect(app.bookList.length).toBe(2);

            const resultList = document.getElementById('result-list');
            const expectedResult = `<li>
                <a href="www.test1.com" class="book" target="_blank">
                    <div class="img" style="background-image: url('undefined')"></div>
                    <div class="info">
                        <div class="wrap">
                            <div class="name" title="test book 1">test book 1</div>
                            <div class="authors ellipsis" title="test person 1"><span>By</span> test person 1</div>
                        </div>
                        <div class="publishing ellipsis" title="test company 1"><span>Publishing By</span> test company 1</div>
                    </div>
                </a>
            </li><li>
                <a href="www.test2.com" class="book" target="_blank">
                    <div class="img" style="background-image: url('undefined')"></div>
                    <div class="info">
                        <div class="wrap">
                            <div class="name" title="test book 2">test book 2</div>
                            <div class="authors ellipsis" title="test person 2"><span>By</span> test person 2</div>
                        </div>
                        <div class="publishing ellipsis" title="test company 2"><span>Publishing By</span> test company 2</div>
                    </div>
                </a>
            </li>`;
            expect(resultList.innerHTML).toBe(expectedResult);
        });

        it('catch an error', async () => {
            const app = new App();

            GoogleBooks.find = jest.fn().mockImplementation(() => Promise.rejects());

            await app.updateBookList('test book name');

            const resultList = document.getElementById('result-list');
            const expectedResult = '<div class="error"><span>Ops! There was an error.</span></div>';
            expect(resultList.innerHTML).toBe(expectedResult);
        });
    });

    describe('onSearch can...', () => {
        const pushState = history.pushState;
        let event = {};

        beforeEach(() => {
            event = {
                preventDefault: jest.fn(),
                target: [{
                        value: ''
                    },
                    {
                        value: 'book name'
                    },
                ]
            };
        });

        it('push state to history', async () => {
            const app = new App();
            const updateBookList = app.updateBookList;

            history.pushState = jest.fn();
            app.updateBookList = jest.fn().mockImplementation(() => Promise.resolve());

            await app.onSearch(event);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(app.updateBookList).toHaveBeenCalledTimes(1);
            expect(history.pushState).toHaveBeenCalledTimes(1);
            history.pushState = pushState;
            app.updateBookList = updateBookList;
        });

        it('create a normal searchQuery', async () => {
            const app = new App();
            const updateBookList = app.updateBookList;

            app.updateBookList = jest.fn().mockImplementation(() => Promise.resolve());

            await app.onSearch(event);
            expect(app.updateBookList).toBeCalledWith('book name');
            app.updateBookList = updateBookList;
        });

        it('create an author searchQuery', async () => {
            const app = new App();
            const updateBookList = app.updateBookList;

            app.updateBookList = jest.fn().mockImplementation(() => Promise.resolve());

            event.target[0].value = 'inauthor:';
            event.target[1].value = 'test author';
            await app.onSearch(event);
            expect(app.updateBookList).toBeCalledWith('inauthor:test author');
            app.updateBookList = updateBookList;
        });
    });
});