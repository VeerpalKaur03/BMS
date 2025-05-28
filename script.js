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

  // Book Classes
  class Book {
    constructor(title, author, isbn, pubdate, genre, price) {
      this.title = title;
      this.author = author;
      this.isbn = isbn;
      this.pubdate = pubdate;
      this.genre = genre;
      this.price = price;
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

    applyDiscount(percent) {
      return this.price ? this.price - (this.price * (percent / 100)) : null;
    }

    isNewRelease() {
      const pubYear = new Date(this.pubdate).getFullYear();
      return (new Date().getFullYear() - pubYear <= 1) ? 'New' : 'Old';
    }
  }

  class EBook extends Book {
    constructor(title, author, isbn, pubdate, genre, price, fileSize, format) {
      super(title, author, isbn, pubdate, genre, price);
      this.fileSize = fileSize;
      this.format = format;
    }
  }

  class PrintedBook extends Book {
    constructor(title, author, isbn, pubdate, genre, price, pages, coverType) {
      super(title, author, isbn, pubdate, genre, price);
      this.pages = pages;
      this.coverType = coverType;
    }
  }

  // Toggle fields based on book type
  function toggleBookFields() {
    ebookFields.classList.toggle('hidden', bookType.value !== 'ebook');
    printedFields.classList.toggle('hidden', bookType.value === 'ebook');
  }

  bookType.addEventListener('change', toggleBookFields);
  toggleBookFields();

 //API Functions 
//fetch books
  async function fetchBooks() {
    const resp = await fetch('http://localhost:3000/books');
    if (!resp.ok) throw new Error('Failed to fetch books');
    return await resp.json();
  }

  //add
  async function addBook(book) {
    const resp = await fetch('http://localhost:3000/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!resp.ok) throw new Error('Failed to add book');
    return await resp.json();
  }

  //update
  async function updateBook(id, book) {
    const resp = await fetch(`http://localhost:3000/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!resp.ok) throw new Error('Failed to update book');
    return await resp.json();
  }

  // delete
  async function deleteBookFromServer(id) {
    const resp = await fetch(`http://localhost:3000/books/${id}`, {
      method: 'DELETE',
    });
    if (!resp.ok) throw new Error('Failed to delete book');
  }

//load
  async function loadBooks() {
    try {
      books = await fetchBooks();
      renderBooks();
    } catch (error) {
      console.error(error.message);
    }
  }

  // render book n print in table
  function renderBooks() {
    tableBody.innerHTML = '';
    books.forEach((book, index) => {
      const bookObj = new Book(book.title, book.author, book.isbn, book.pubdate, book.genre, book.price);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>${book.pubdate}</td>
        <td>${book.genre}</td>
        <td>${bookObj.calculateAge()}</td>
        <td>${bookObj.categorize()}</td>
        <td>${book.price}</td>
        <td>$${bookObj.applyDiscount(10)} <span class="text-green-500 text-sm">(10% off)</span></td>
        <td>${bookObj.isNewRelease()}</td>
        <td>
          <button onclick="editBook(${index})" class="text-blue-500">Edit</button>
          <button onclick="deleteBook(${index})" class="text-red-500">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // render filter books
  function renderFilteredBooks(filtered) {
    tableBody.innerHTML = '';
    filtered.forEach((book, index) => {
      const bookObj = new Book(book.title, book.author, book.isbn, book.pubdate, book.genre, book.price);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>${book.pubdate}</td>
        <td>${book.genre}</td>
        <td>${bookObj.calculateAge()}</td>
        <td>${bookObj.categorize()}</td>
        <td>${book.price}</td>
        <td>$${bookObj.applyDiscount(10)} <span class="text-green-500 text-sm">(10% off)</span></td>
        <td>${bookObj.isNewRelease()}</td>
        <td>
          <button onclick="editBook(${index})" class="text-blue-500">Edit</button>
          <button onclick="deleteBook(${index})" class="text-red-500">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }




  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('ISBN').value.trim();
    const pubdate = document.getElementById('pubdate').value;
    const genre = document.getElementById('genre').value.trim();
    const price = document.getElementById('price').value.trim();

    if (![title, author, isbn, pubdate, genre, price].every(Boolean)) {
      return alert('Please fill in all fields.');
    }

    if (isNaN(isbn)) {
      return alert('ISBN must be numeric.');
    }

    const newBook = new Book(title, author, isbn, pubdate, genre, price);

    try {
      if (editIndex !== null) {
        const bookId = books[editIndex].id;
        const updatedBook = await updateBook(bookId, newBook);
        books[editIndex] = updatedBook;
        editIndex = null;
        submitBtn.value = "Add Book";
      } else {
        const savedBook = await addBook(newBook);
        books.push(savedBook);
      }

      renderBooks();
      form.reset();
      toggleBookFields();
    } catch (error) {
      alert('Error saving book: ' + error.message);
    }
  });

  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = books.filter(
      b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
    );
    renderFilteredBooks(filtered);
  });

  sortAZBtn.addEventListener('click', () => {
    books.sort((a, b) => a.title.localeCompare(b.title));
    renderBooks();
  });

  sortZABtn.addEventListener('click', () => {
    books.sort((a, b) => b.title.localeCompare(a.title));
    renderBooks();
  });


  
  window.editBook = (index) => {
    const book = books[index];
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('ISBN').value = book.isbn;
    document.getElementById('pubdate').value = book.pubdate;
    document.getElementById('genre').value = book.genre;
    document.getElementById('price').value = book.price;
    editIndex = index;
    submitBtn.value = "Update Book";
  };

  window.deleteBook = async (index) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    const bookId = books[index].id;
    try {
      await deleteBookFromServer(bookId);
      books.splice(index, 1);
      renderBooks();
    } catch (err) {
      alert(err.message);
    }
  };


  loadBooks();
});
