document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookForm');
  const tableBody = document.getElementById('bookTable');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const submitBtn = document.getElementById('submitBtn');
  const sortAZBtn = document.getElementById('sortAZ');
  const sortZABtn = document.getElementById('sortZA');
  const bookType = document.getElementById('bookType');
  const ebookFields = document.getElementById('ebookFields');
  const printedFields = document.getElementById('printedFields');

  let books = [];
  let editIndex = null;

  class Book {
    constructor(title, author, isbn, pubdate, genre) {
      this.title = title;
      this.author = author;
      this.isbn = isbn;
      this.pubdate = pubdate;
      this.genre = genre;
    }
    calculateAge() {
      return new Date().getFullYear() - new Date(this.pubdate).getFullYear();
    }
    categorize() {
      const g = this.genre.toLowerCase();
      if (['sci-fi', 'fantasy', 'horror'].includes(g)) return 'Fiction';
      if (['biography', 'history', 'self-help'].includes(g)) return 'Non-Fiction';
      if (['romance', 'drama'].includes(g)) return 'Literature';
      if (['thriller', 'mystery'].includes(g)) return 'Mystery';
      return 'Other';
    }
  }

  class EBook extends Book {
    constructor(title, author, isbn, pubdate, genre, fileSize, format) {
      super(title, author, isbn, pubdate, genre);
      this.fileSize = fileSize;
      this.format = format;
    }
  }

  class PrintedBook extends Book {
    constructor(title, author, isbn, pubdate, genre, pages, coverType) {
      super(title, author, isbn, pubdate, genre);
      this.pages = pages;
      this.coverType = coverType;
    }
  }

  function toggleBookFields() {
    if (bookType.value === 'ebook') {
      ebookFields.classList.remove('hidden');
      printedFields.classList.add('hidden');
    } else {
      ebookFields.classList.add('hidden');
      printedFields.classList.remove('hidden');
    }
  }

  bookType.addEventListener('change', toggleBookFields);
  toggleBookFields();

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
      alert('Search failed');
    }
  });

  sortAZBtn.addEventListener('click', () => {
    books.sort((a, b) => a.title.localeCompare(b.title));
    renderBooks();
  });

  sortZABtn.addEventListener('click', () => {
    books.sort((a, b) => b.title.localeCompare(a.title));
    renderBooks();
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

    const newBook = new Book(title, author, isbn, pubdate, genre);

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
      toggleBookFields();
    } catch (error) {
      alert('Error saving book: ' + error.message);
    }
  });

  function renderBooks() {
    tableBody.innerHTML = '';
    books.forEach((book, index) => {
      const bookObj = new Book(book.title, book.author, book.isbn, book.pubdate, book.genre);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>${book.pubdate}</td>
        <td>${book.genre}</td>
        <td>${bookObj.calculateAge()}</td>
        <td>${bookObj.categorize()}</td>
        <td>
          <button onclick="editBook(${index})" class="text-blue-500">Edit</button>
          <button onclick="deleteBook(${index})" class="text-red-500">Delete</button>
        </td>`;
      tableBody.appendChild(row);
    });
  }

  function renderFilteredBooks(filtered) {
    tableBody.innerHTML = '';
    filtered.forEach((book, index) => {
      const bookObj = new Book(book.title, book.author, book.isbn, book.pubdate, book.genre);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>${book.pubdate}</td>
        <td>${book.genre}</td>
        <td>${bookObj.calculateAge()}</td>
        <td>${bookObj.categorize()}</td>
        <td>
          <button onclick="editBook(${index})" class="text-blue-500">Edit</button>
          <button onclick="deleteBook(${index})" class="text-red-500">Delete</button>
        </td>`;
      tableBody.appendChild(row);
    });
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
    if (!confirm('Are you sure you want to delete this book?')) return;
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
