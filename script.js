document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookForm');
    const tableBody = document.getElementById('bookTable');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const submitBtn = document.getElementById('submitBtn');

    let books = [];
    let editIndex = null;

    async function loadBooks() {
        try {
            const resp = await fetch('http://localhost:3000/books');
            if (!resp.ok) throw new Error('Failed to fetch books');
            books = await resp.json();
            renderBooks();
        } catch (error) {
            console.error(error);
        }
    }

    loadBooks();

    function serverRequest(action, bookData = null) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const isError = action !== 'search' && Math.random() < 0.2;
                if (isError) {
                    reject(`Error: Failed to ${action} book`);
                } else {
                    resolve({ status: 'success', data: bookData });
                }
            }, 1000);
        });
    }

    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim().toLowerCase();
        try {
            await serverRequest('search');
            const filtered = books.filter(b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query));
            renderFilteredBooks(filtered);
        } catch (err) {
            console.error(err);
            alert('Search failed');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const isbn = document.getElementById('ISBN').value.trim();
        const pubdate = document.getElementById('pubdate').value;
        const genre = document.getElementById('genre').value.trim();

        if (![title, author, isbn, pubdate, genre].every(Boolean)) {
            return alert('Please fill in all fields.');
        }

        if (isNaN(isbn)) {
            return alert('ISBN must be numeric.');
        }

        const newBook = { title, author, isbn, pubdate, genre };

        try {
            if (editIndex !== null) {
                const bookId = books[editIndex].id;
                const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBook),
                });
                if (!response.ok) throw new Error('Failed to update book');
                const updatedBook = await response.json();
                books[editIndex] = updatedBook;
                editIndex = null;
                submitBtn.value = "Add Book";

            } else {
                const response = await fetch('http://localhost:3000/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBook),
                });
                if (!response.ok) throw new Error('Failed to add book');
                const savedBook = await response.json();
                books.push(savedBook);
            }
            renderBooks();
            form.reset();
        } catch (error) {
            console.error(error);
            alert('Error saving book: ' + error.message);
        }
    });
    //render data to table
    function renderBooks() {
        tableBody.innerHTML = '';
        books.forEach((book, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>${book.pubdate}</td>
                <td>${book.genre}</td>
                <td>${calculateBookAge(book.pubdate)}</td>
                <td>${categorizeGenre(book.genre)}</td>
                <td>
                    <button onclick="editBook(${index})" class="text-blue-500">Edit</button>
                    <button onclick="deleteBook(${index})" class="text-red-500">Delete</button>
                </td>`;
            tableBody.appendChild(row);
        });
    }
    
    //render filtered books
    function renderFilteredBooks(filtered) {
        tableBody.innerHTML = '';
        filtered.forEach((book, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>${book.pubdate}</td>
                <td>${book.genre}</td>
                <td>${calculateBookAge(book.pubdate)}</td>
                <td>${categorizeGenre(book.genre)}</td>
                <td>
                    <button onclick="editBook(${index})" class="text-blue-500">Edit</button>
                    <button onclick="deleteBook(${index})" class="text-red-500">Delete</button>
                </td>`;
            tableBody.appendChild(row);
        });
    }

    function calculateBookAge(pubDate) {
        return new Date().getFullYear() - new Date(pubDate).getFullYear();
    }

    function categorizeGenre(genre) {
        const g = genre.toLowerCase();
        if (['sci-fi', 'fantasy', 'horror'].includes(g)) return 'Fiction';
        if (['biography', 'history', 'self-help'].includes(g)) return 'Non-Fiction';
        if (['romance', 'drama'].includes(g)) return 'Literature';
        if (['thriller', 'mystery'].includes(g)) return 'Mystery';
        return 'Other';
    }

    window.editBook = (index) => {
        const book = books[index];
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('ISBN').value = book.isbn;
        document.getElementById('pubdate').value = book.pubdate;
        document.getElementById('genre').value = book.genre;
        editIndex = index;
        submitBtn.value = "Update Book";
    };

    window.deleteBook = async (index) => {
        const confirmDelete = confirm('Are you sure you want to delete this book?');
        if (!confirmDelete) return;
        const bookId = books[index].id;
        try {
            const resp = await fetch(`http://localhost:3000/books/${bookId}`, { method: 'DELETE' });
            if (!resp.ok) throw new Error('Failed to delete book');
            books.splice(index, 1);
            renderBooks();
        } catch (err) {
            alert(err.message);
        }
    };
});
