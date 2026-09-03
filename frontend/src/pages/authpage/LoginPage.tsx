

const Login = () => {

    return(
        <form className="flex flex-col gap-4 w-full max-w-md mx-auto mt-20">
            <label className="flex flex-col gap-1">
                <span className="text-sm text-[var(--color-text-muted)]">Email</span>
                <input type="email" className="px-4 py-2 rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm text-[var(--color-text-muted)]">Password</span>
                <input type="password" className="px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </label>
            <button type="submit" className="bg-[var(--color-accent)] hover:bg-[var(--color-text)] text-[var(--color-bg)] px-4 py-2 rounded-[var(--radius-sm)] font-medium">Login</button>
        </form>
    );
};

export default Login;