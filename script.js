document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookForm');
    const tableBody = document.querySelector('#bookTable tbody');
    const searchInput=document.getElementById('searchInput');
    const searchBtn=document.getElementById('searchBtn');

    let editIndex = null;
    const books = [];

    //simulate a server req using promise
    function serverRequest(action, bookData = null) {
        return new Promise((resolve, reject) => {
            console.log(`Processing ${action} request...`);

            setTimeout(() => {
                const isError = action !== 'search' && Math.random() < 0.2;

                if (isError) {
                    reject(`Error: Failed to ${action} book data`);
                } else {
                    resolve({ status: "success", data: bookData });
                }
            }, 1000);
        });
    }



    //search the book by its name or by author's name
    searchBtn.addEventListener('click', async()=>{
        const query=searchInput.value.trim().toLowerCase();

        try{
            const resp=await serverRequest('search');
            const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query));
            renderFilteredBooks(filteredBooks);

        }catch (error) {
            console.error(error);
            alert('Failed to search books.');
        }
    })


    // fetching data from external API
    //get req
    async function getData() {
        try {
            let resp = await fetch('https://jsonplaceholder.typicode.com/todos/1')  // return a promise
            let data = await resp.json();
            console.log(data);
        } catch (error) {
            console.error('GET Error:', error.message);
        }

    }


    //post req
    async function postData() {
        try {
            let resp = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'I m the title',
                    body: 'I m body',
                    userId: 1
                })
            });

            const data = await resp.json()
            console.log(data);
        } catch (error) {
            console.error('POST Error:', error.message);
        }
    }


    //put req
    async function putData() {
        try {
            let resp = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    ID: 1,
                    title: 'updated title',
                    body: 'updated body',
                    userId: 1

                })
            });
            const data = await resp.json();
            console.log(data);
        } catch (error) {
            console.error('PUT Error:', error.message);
        }
    }


    //delete req
    async function deleteData() {
        try {
            const resp = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
                method: 'DELETE'
            });
            if (resp.ok) {
                console.log('delete was successful');
            } else {
                console.log('not successful')
            }

        } catch (error) {
            console.error('DELETE Error:', error.message);
        }
    }


    function renderBooks() {
        tableBody.innerHTML = '';

        books.forEach((book, index) => {
            const age = calculateBookAge(book.pubdate);
            const category = categorizeGenre(book.genre);

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.pubdate}</td>
            <td>${book.genre}</td>
            <td>${age}</td>
            <td>${category}</td>
            <td>
                <button onclick="editBook(${index})">Edit</button>
                <button onclick="deleteBook(${index})">Delete</button>
            </td>`;
            tableBody.appendChild(row);
        });
    }


        function renderFilteredBooks(filteredBooks) {
        tableBody.innerHTML = '';

        filteredBooks.forEach((book, index) => {
            const age = calculateBookAge(book.pubdate);
            const category = categorizeGenre(book.genre);

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.pubdate}</td>
            <td>${book.genre}</td>
            <td>${age}</td>
            <td>${category}</td>
            <td>
                <button onclick="editBook(${index})">Edit</button>
                <button onclick="deleteBook(${index})">Delete</button>
            </td>`;
            tableBody.appendChild(row);
        });
    }


    function calculateBookAge(pubDate) {
        const pubYear = new Date(pubDate).getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - pubYear;
    }


    function categorizeGenre(genre) {
        const g = genre.toLowerCase();
        if (['sci-fi', 'fantasy', 'horror'].includes(g)) return 'Fiction';
        if (['biography', 'history', 'self-help'].includes(g)) return 'Non-Fiction';
        if (['romance', 'drama'].includes(g)) return 'Literature';
        if (['thriller', 'mystery'].includes(g)) return 'Mystery';
        return 'Other';
    }



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
            return alert('ISBN must be a numeric value.');
        }

        const newBook = { title, author, isbn, pubdate, genre };
        let data1 = await getData();
        let data2 = await postData();
        let data3 = await putData();
        let data4 = await deleteData();


        try {
            await serverRequest("add", newBook);

            if (editIndex !== null) {
                books[editIndex] = newBook;
                editIndex = null;
            } else {
                books.push(newBook);
            }

            renderBooks();
        } catch (error) {
            console.error(error);
            alert(error);
        }

        form.reset();
        
    });

    window.editBook = (index) => {
        const book = books[index];
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('ISBN').value = book.isbn;
        document.getElementById('pubdate').value = book.pubdate;
        document.getElementById('genre').value = book.genre;

        editIndex = index;
    };


    window.deleteBook = async (index) => {
        const confirmDelete = confirm('Are you sure you want to delete this book?');
        if (!confirmDelete) return;

        try {
            await serverRequest("delete");
            books.splice(index, 1);
            renderBooks();
        } catch (error) {
            console.error(error);
            alert(error);
        }
    };
});
