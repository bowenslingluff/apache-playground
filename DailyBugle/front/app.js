document.addEventListener('DOMContentLoaded', () => {

    // Get user data from local storage
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("Logged in user:", user);
    let currentArticleId = null;

    const featuredImage = document.getElementById('featured-image');
    const articleImage = document.getElementById('article-image');
    const adText = document.getElementById('ad-text');
    const adImage = document.getElementById('ad-image');

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const articleListTitle = document.getElementById('article-list-title');

    const navAuth = document.getElementById('nav-auth');
    const articleListView = document.getElementById('article-list-view');
    const articleSingleView = document.getElementById('article-single-view');
    const articleListContainer = document.getElementById('article-list-container');
    const backToListLink = document.getElementById('back-to-list');
    const backToHomeLink = document.getElementById('back-to-home');


    const featuredArticleView = document.getElementById('featured-article');
    const featuredTitle = document.getElementById('featured-title');
    const featuredDate = document.getElementById('featured-date');
    const featuredBody = document.getElementById('featured-body');

    const createArticleView = document.getElementById('create-article-view');
    const createArticleForm = document.getElementById('create-article-form');
    const cancelCreateBtn = document.getElementById('cancel-create-btn');
    const newPostBtn = document.getElementById('new-post-btn');
    const deletePostBtn = document.getElementById('delete-post-btn');

    // Single article elements
    const articleTitle = document.getElementById('article-title');
    const articleDate = document.getElementById('article-date');
    const articleBody = document.getElementById('article-body');

    // Ad elements
    const adContainer = document.getElementById('ad-container');
    const adContent = document.getElementById('ad-content');

    // Comment elements
    const commentForm = document.getElementById('comment-form');
    const commentList = document.getElementById('comment-list');

    // Update header based on login status
    function setupNav() {
        if (token && user) { 

            navAuth.innerHTML = `
                <span>Welcome, ${user.username} (${user.role})</span>
                <button id="logout-btn">Logout</button>
            `;

            if (user.role === 'Author') {
                newPostBtn.classList.remove('hidden');
                newPostBtn.addEventListener('click', showCreateArticleView);
            }
            
            // Add check for logout button
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            });
            // Show comment form 
            commentForm.classList.remove('hidden');
            if (user.role !== 'Author') {
                loadRandomAd();
            }
        } else {
            // User is anonymous
            navAuth.innerHTML = '<a href="login.html"><button>Login</button></a>';
            loadRandomAd(); 
        }
    }

    // Fetch teasers for all articles
    async function fetchArticleList() {
        try {
            const res = await fetch(`${API_URLS.articles}/articles`);
            if (!res.ok) throw new Error('Failed to fetch articles');
            const articles = await res.json();
            renderArticleList(articles);
        } catch (err) {
            articleListContainer.innerHTML = `<p>Error: ${err.message}</p>`;
        }
    }

    async function fetchSearchResults(query) {
        try {
            // Call the search endpoint
            const res = await fetch(`${API_URLS.articles}/articles/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Search failed to return results');
            
            const articles = await res.json();
            
            articleListView.classList.remove('hidden');
            articleSingleView.classList.add('hidden');
            createArticleView.classList.add('hidden');
            featuredArticleView.classList.add('hidden');
            
            // --- Update the UI ---
            articleListTitle.textContent = `Search Results for "${query}"`;
            backToHomeLink.classList.remove('hidden');
            renderArticleList(articles); 
            
        } catch (err) {
            console.error(err);
            articleListTitle.textContent = `Search Results`;
            articleListContainer.innerHTML = `<p>${err.message}</p>`;
        }
    }

    // Fetch a single full article
    async function fetchSingleArticle(id) {
        try {
            currentArticleId = id;
            const res = await fetch(`${API_URLS.articles}/articles/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch article');
            const article = await res.json();
            renderSingleArticle(article);
            
            articleListView.classList.add('hidden');
            articleSingleView.classList.remove('hidden');
            featuredArticleView.classList.add('hidden');
            if (user && user.role === 'Author' && article.authorId === user.id) {
                deletePostBtn.classList.remove('hidden');
            } else {
                deletePostBtn.classList.add('hidden');
            }
        } catch (err) {
            console.error(err);
            showArticleList(); 
        }
    }

    async function fetchFeaturedArticle() {
        try {
            const res = await fetch(`${API_URLS.articles}/articles/featured`);
            if (!res.ok) throw new Error('No featured article found');
            
            const article = await res.json();

            if (article.imageUrl) {
                featuredImage.src = article.imageUrl;
                featuredImage.style.display = 'block';
            } else {
                featuredImage.style.display = 'none';
            }
            
            featuredTitle.textContent = article.title;
            featuredDate.textContent = new Date(article.createdAt).toLocaleDateString();
            
            const maxChars = 1000; 
            let bodyText = article.body;

            if (bodyText.length > maxChars) {
                const cutOff = bodyText.lastIndexOf(' ', maxChars);
                const finalCutOff = (cutOff === -1) ? maxChars : cutOff;
                
                bodyText = bodyText.substring(0, finalCutOff) + "...";
            }
            featuredBody.innerHTML = bodyText.replace(/\n/g, '<br>');
            
            featuredTitle.style.cursor = 'pointer';

            featuredTitle.addEventListener('click', () => {
                if (!token) {
                    alert('Please log in to read the full story and comment.');
                    window.location.href = 'login.html';
                } else {
                    fetchSingleArticle(article._id);
                }
            });
            
            featuredArticleView.classList.remove('hidden');
        } catch (err) {
            console.warn(err.message);
            featuredArticleView.classList.add('hidden'); 
        }
    }

    // fetch a random ad
    async function loadRandomAd() {
        try {
            const res = await fetch(`${API_URLS.ads}/ads/random`);
            if (!res.ok) throw new Error('No ads available');
            const ad = await res.json();
            
            // Render the ad
            if (ad.imageUrl) {
                adImage.src = ad.imageUrl;
                adImage.style.display = 'block';
            } else {
                adImage.style.display = 'none';
            }
            adText.textContent = ad.advertisement;
            adText.style.display = 'block';
            adContainer.classList.remove('hidden');
            
            // Record ad view
            recordAdEvent('impression', ad._id);

            // Handle ad click
            adContainer.addEventListener('click', () => {
                recordAdEvent('interaction', ad._id);
            });

        } catch (err) {
            console.error(err.message);
            adContent.textContent = 'No ads to display.';
        }
    }
    
    // Record an ad event (impression or interaction)
    async function recordAdEvent(eventType, adId) {
        fetch(`${API_URLS.ads}/ads/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adId: adId,
                eventType: eventType,
                userId: user ? user.id : null 
            })
        });
    }
    
    // post a comment
    async function postNewComment(e) {
        e.preventDefault();
        const commentBody = document.getElementById('comment-body').value;
        if (!commentBody || !currentArticleId) return;

        try {
            const res = await fetch(`${API_URLS.articles}/articles/${currentArticleId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ commentBody })
            });

            if (!res.ok) throw new Error('Failed to post comment');
            
            const updatedArticle = await res.json();

            renderComments(updatedArticle.comments);
            document.getElementById('comment-body').value = '';

        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`);
        }
    }

    // Render the list of article teasers
    function renderArticleList(articles) {
        if (articles.length === 0) {
            articleListContainer.innerHTML = '<p>No articles found.</p>';
            return;
        }
        
        articleListContainer.innerHTML = articles.map(article => {
            // We give the image a specific class 'article-thumb' 
            const imgHtml = article.imageUrl
                ? `<img src="${article.imageUrl}" alt="${article.title}" class="article-thumb">`
                : '';

            return `
                <article data-id="${article._id}" class="article-card">
                    
                    <div class="article-text">
                        <h3>${article.title}</h3>
                        <p>${article.teaser}</p>
                        <small>Categories: ${article.categories.join(', ')}</small>
                    </div>

                    ${imgHtml} 
                    
                </article>
            `;
        }).join('');
    }

    function showCreateArticleView() {
        articleListView.classList.add('hidden');
        articleSingleView.classList.add('hidden');
        createArticleView.classList.remove('hidden');
        featuredArticleView.classList.add('hidden');
        newPostBtn.classList.add('hidden');
    }

    async function handleCreateArticle(e) {
        e.preventDefault();
        const msgEl = document.getElementById('create-message');
        
        const title = document.getElementById('create-title').value;
        const teaser = document.getElementById('create-teaser').value;
        const body = document.getElementById('create-body').value;
        const imageUrl = document.getElementById('create-image-url').value;
        const categories = document.getElementById('create-categories').value.split(',')
                           .map(cat => cat.trim()).filter(cat => cat);

        try {
            const res = await fetch(`${API_URLS.articles}/articles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, teaser, body, categories, imageUrl })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message);
            }

            const newArticle = await res.json();
            
            msgEl.textContent = 'Article created successfully!';
            msgEl.className = 'message success';
            createArticleForm.reset();
            
            setTimeout(() => {
                msgEl.textContent = '';
                msgEl.className = 'message';
                showArticleList();
                fetchArticleList();
            }, 200);

        } catch (err) {
            msgEl.textContent = `Error: ${err.message}`;
            msgEl.className = 'message error';
        }
    }

    async function handleDeleteArticle() {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`${API_URLS.articles}/articles/${currentArticleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            }

            alert('Article deleted successfully.');
            
            // Go back to the main list
            showArticleList();
            fetchArticleList(); // Refresh the list to remove the deleted item

        } catch (err) {
            console.error(err);
            alert(`Error deleting article: ${err.message}`);
        }
    }

    // render a single full article
    function renderSingleArticle(article) {
        if (article.imageUrl) {
            articleImage.src = article.imageUrl;
            articleImage.style.display = 'block';
        } else {
            articleImage.style.display = 'none';
        }
        articleTitle.textContent = article.title;
        articleDate.textContent = new Date(article.createdAt).toLocaleDateString();
        articleBody.innerHTML = article.body.replace(/\n/g, '<br>'); // Convert newlines to <br>
        renderComments(article.comments);
    }
    
    // render comments for an article
    function renderComments(comments) {
        if (comments.length === 0) {
            commentList.innerHTML = '<p>No comments yet.</p>';
            return;
        }
        commentList.innerHTML = comments.map(comment => `
            <div class="comment">
                <strong>${comment.username}</strong>
                <p>${comment.commentBody}</p>
                <small>${new Date(comment.createdAt).toLocaleString()}</small>
            </div>
        `).join('');
    }

    // Show the article list view
    function showArticleList() {
        articleListView.classList.remove('hidden');
        articleSingleView.classList.add('hidden');
        createArticleView.classList.add('hidden');
        featuredArticleView.classList.remove('hidden');
        currentArticleId = null;

        articleListTitle.textContent = 'Latest Stories';
        searchInput.value = '';
        backToHomeLink.classList.add('hidden');

        if (user && user.role === 'Author') {
            newPostBtn.classList.remove('hidden');
        }
        deletePostBtn.classList.add('hidden');

        fetchFeaturedArticle();
        fetchArticleList();
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // --- ADD THIS CHECK ---
        if (!token) {
            articleListTitle.textContent = 'You must be logged in to search.';
            articleListContainer.innerHTML = '';
            
            // Make sure the main list view is visible
            articleListView.classList.remove('hidden');
            articleSingleView.classList.add('hidden');
            createArticleView.classList.add('hidden');
            featuredArticleView.classList.add('hidden');
            return;
        }
        const query = searchInput.value;
        if (query) {
            featuredArticleView.classList.add('hidden');
            // If we are here, the user is logged in AND has a query
            fetchSearchResults(query);
        }
    });

    createArticleForm.addEventListener('submit', handleCreateArticle);

    // Listen for clicks on the "Cancel" button in the create form
    cancelCreateBtn.addEventListener('click', () => {
        createArticleView.classList.add('hidden');
        showArticleList(); 
    });

    deletePostBtn.addEventListener('click', handleDeleteArticle);

    // Return to article list on back link click
    backToListLink.addEventListener('click', showArticleList);
    backToHomeLink.addEventListener('click', showArticleList);
    
    // Post new comment on form submit
    commentForm.addEventListener('submit', postNewComment);

    // Listen for clicks on the article list
    articleListContainer.addEventListener('click', (e) => {
        const articleElement = e.target.closest('article');
        if (articleElement) {
            if (!token) {
                alert('Please log in to read the full story.');
                window.location.href = 'login.html';
            } else {
                // If logged in, fetch the full article
                const id = articleElement.dataset.id;
                fetchSingleArticle(id);
                featuredArticleView.classList.add('hidden');
            }
        }
    });

    function init() {
        setupNav();
        fetchFeaturedArticle();
        fetchArticleList(); 
    }

    // Start the application
    init();
});