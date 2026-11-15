const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Task 6 / Task 7: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some((user) => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1 & Task 10: Get the book list available in the shop using Promises / async-await
function getBookList() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBookList();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
});

// Task 2 & Task 11: Get book details based on ISBN using Promises / async-await
function getFromISBN(isbn) {
    return new Promise((resolve, reject) => {
        let book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });
}

public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getFromISBN(isbn);
        return res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
});

// Task 3 & Task 12: Get book details based on author using Promises / async-await
function getFromAuthor(author) {
    return new Promise((resolve, reject) => {
        let matchingBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push(books[key]);
            }
        });
        resolve(matchingBooks);
    });
}

public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await getFromAuthor(author);
        if (matchingBooks.length > 0) {
            return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
        } else {
            return res.status(404).json({ message: `No books found by author ${author}` });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Task 4 & Task 13: Get all books based on title using Promises / async-await
function getFromTitle(title) {
    return new Promise((resolve, reject) => {
        let matchingBooks = [];
        let keys = Object.keys(books);
        keys.forEach((key) => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push(books[key]);
            }
        });
        resolve(matchingBooks);
    });
}

public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchingBooks = await getFromTitle(title);
        if (matchingBooks.length > 0) {
            return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
        } else {
            return res.status(404).json({ message: `No books found with title ${title}` });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

// Task 5 / Task 6: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
