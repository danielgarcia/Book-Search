import 'babel-polyfill';
import GoogleBooks from './GoogleBooks';
import fetchMock from 'fetch-mock';

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

describe('verify GoogleBooks Service...', () => {
    const GoogleBooksFind = GoogleBooks.find;

    afterEach(() => {
        GoogleBooks.find = GoogleBooksFind;
        fetchMock.restore();
    });

    it('returns no books', async () => {
        const responseBooks = {
            items: getBooks(0)
        };

        fetchMock.get('https://www.googleapis.com/books/v1/volumes?q=book%20title', {
            status: 200,
            body: JSON.stringify(responseBooks)
        });

        const result = await GoogleBooks.find('book title');
        expect(result.length).toBe(0);
        expect(result).toEqual([]);
    });

    it('returns 10 books', async () => {
        const responseBooks = {
            items: getBooks(10)
        };

        fetchMock.get('https://www.googleapis.com/books/v1/volumes?q=book%20title', {
            status: 200,
            body: JSON.stringify(responseBooks)
        });

        const result = await GoogleBooks.find('book title');
        expect(result.length).toBe(10);
        expect(result).toEqual(responseBooks.items);
    });

    it('can throw an error', async () => {
        fetchMock.get('https://www.googleapis.com/books/v1/volumes?q=book%20title', {
            status: 400,
            body: JSON.stringify("bad data")
        });

        expect(GoogleBooks.find('book title')).rejects.toEqual(new Error("Error Fetching Books"));
    });
});