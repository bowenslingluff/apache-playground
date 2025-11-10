document.addEventListener('DOMContentLoaded', () => {

    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    // Toggle register form
    showRegisterLink.addEventListener('click', () => {
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    });

    // toggle login form
    showLoginLink.addEventListener('click', () => {
        loginView.style.display = 'block';
        registerView.style.display = 'none';
    });

    // handle registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            // Call auth service /register endpoint
            const res = await fetch(`${API_URLS.auth}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                registerMessage.textContent = 'Registration successful! You can now login.';
                registerMessage.className = 'message success';
            } else {
                throw new Error(data.message); // Show error from server
            }
        } catch (err) {
            registerMessage.textContent = err.message;
            registerMessage.className = 'message error';
        }
    });

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            // Call auth service /login endpoint
            const res = await fetch(`${API_URLS.auth}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            
            if (res.ok) {
                // SUCCESS! Store the token and user info in the browser's local storage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // 2. Redirect to the main app page
                window.location.href = 'index.html';
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            loginMessage.textContent = err.message;
            loginMessage.className = 'message error';
        }
    });
});