document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookForm');
    const tableBody = document.querySelector('#bookTable tbody');
  
    let editIndex = null;
    const books = [];
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('title').value.trim();
      const author = document.getElementById('author').value.trim();
      const isbn = document.getElementById('ISBN').value.trim();
      const pubdate = document.getElementById('pubdate').value;
      const genre = document.getElementById('genre').value.trim();
  
      if (![title, author, isbn, pubdate, genre].every(Boolean)) {
        return alert('Please fill in all fields.');
      }
  
      if(isNaN(isbn)) {
        return alert('ISBN must be a numeric value.');
      }
  
      const book = { title, author, isbn, pubdate, genre };
  
      if (editIndex !== null) {
        books[editIndex] = book;
        editIndex = null;
      } else {
        books.push(book);
      }
  
      form.reset();
      renderBooks();
    });
  


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
            <button onclick="editBook(${index})"> Edit </button>
            <button onclick="deleteBook(${index})"> Delete </button>
          </td>`;
        tableBody.appendChild(row);
      });
    }

    function calculateBookAge(pubDate){
        const pubYear=new Date(pubDate).getFullYear();
        const currentYear=new Date().getFullYear();
        return currentYear - pubYear;
    }

    function categorizeGenre(genre){
        const g= genre.toLowerCase();
        if(['sci-fi', 'fantasy', 'horror'].includes(g)) return 'Fiction';
        if(['biography', 'history', 'self-help'].includes(g)) return 'Non - Fiction';
        if(['romance', 'drama'].includes(g)) return 'Literature';
        if(['mind-bending', 'psychological', 'thriller'].includes(g)) return 'Mystery';
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
    };
  

    window.deleteBook = (index) => {
      let answer=confirm('Are you sure you want to delete this book?');
      if (answer) {
        books.splice(index, 1);
        renderBooks();
      }
    };
  });