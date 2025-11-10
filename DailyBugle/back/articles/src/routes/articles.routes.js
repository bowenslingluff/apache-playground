const express = require('express');
const router = express.Router();
const Article = require('../models/article.model');
const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

const checkAuthor = (req, res, next) => {
    const userRole = req.userRole;
    if (userRole !== 'Author') {
        return res.status(403).json({ message: 'Requires Author Role' });
    }
    next();
};

router.get('/', async (req, res) => {
    try {
        const articles = await Article.find()
            .select('title teaser author categories createdAt')
            .sort({ createdAt: -1 });
        res.status(200).json(articles);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', checkAuth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json(article);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', checkAuth, checkAuthor, async (req, res) => {
    try {
        const { title, teaser, body, categories } = req.body;

        const newArticle = new Article({
            title,
            teaser,
            body,
            categories,
            authorId: req.user.id
        });
        
        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', checkAuth, checkAuthor, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (article.authorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You are not the original author' });
        }

        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } 
        );
        res.status(200).json(updatedArticle);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
    
router.delete('/:id', checkAuth, checkAuthor, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (article.authorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You are not the original author' });
        }

        await Article.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/comment', checkAuth, async (req, res) => {
    try {
        const { commentBody } = req.body;

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const newComment = {
            commentBody: commentBody,
            userId: req.user.id,
            username: req.user.username
        };
        
        article.comments.unshift(newComment);
        await article.save();

        res.status(201).json(article);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;

        const results = await Article.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        )
        .select('title teaser categories createdAt')
        .sort({ score: { $meta: "textScore" } });

        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;