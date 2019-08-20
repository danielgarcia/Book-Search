export default class GoogleBooks {
    static async find(title) {
        if (!title) {
            return [];
        }

        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error("Error Fetching Books");
        }

        const payload = await response.json();
        return payload.items || [];
    }
}