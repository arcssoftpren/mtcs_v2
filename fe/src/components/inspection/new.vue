<template>
    <div class="login-container">
        <form @submit.prevent="handleLogin" class="login-form">
            <h2>Login</h2>
            <div class="form-group">
                <label for="username">Username</label>
                <input v-model="username" id="username" type="text" required />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input v-model="password" id="password" type="password" required />
            </div>
            <button type="submit">Login</button>
            <p v-if="error" class="error">{{ error }}</p>
        </form>
    </div>
</template>

<script>
export default {
    name: "LoginPage",
    data() {
        return {
            username: "",
            password: "",
            error: ""
        };
    },
    methods: {
        handleLogin() {
            // Dummy authentication logic
            if (this.username === "admin" && this.password === "password") {
                this.error = "";
                // Redirect or emit event here
                alert("Login successful!");
            } else {
                this.error = "Invalid username or password.";
            }
        }
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
}
.login-form {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    width: 300px;
}
.form-group {
    margin-bottom: 1rem;
}
label {
    display: block;
    margin-bottom: 0.5rem;
}
input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
}
button {
    width: 100%;
    padding: 0.7rem;
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
}
button:hover {
    background: #0056b3;
}
.error {
    color: red;
    margin-top: 1rem;
    text-align: center;
}
</style>