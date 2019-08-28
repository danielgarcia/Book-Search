export default class GoogleBooks {

    /**
     * Finds Books and returns an array of books using google's book api
     */
    static async find(searchQuery) {
        if (!searchQuery) {
            return [];
        }

        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error("Error Fetching Books");
        }

        const payload = await response.json();
        return payload.items || [];
    }
}