import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, UserRound, X } from "lucide-react";
import type { LoginInfo, SignupInfo } from "@shared/api-types/auth";
import { login, signup, type AuthState } from "../auth/authClient";

type AuthMode = "login" | "signup";

type AuthPanelProps = {
    open: boolean;
    onClose: () => void;
    onAuthenticated: (session: AuthState) => void;
};

type AuthFormState = SignupInfo;

const initialFormState: AuthFormState = {
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
};

export function AuthPanel({ open, onClose, onAuthenticated }: AuthPanelProps) {
    const [mode, setMode] = useState<AuthMode>("login");
    const [formData, setFormData] = useState<AuthFormState>(initialFormState);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    if (!open) return null;

    const updateField = (field: keyof AuthFormState, value: string) => {
        setFormData(current => ({ ...current, [field]: value }));
        setMessage(null);
    };

    const switchMode = (nextMode: AuthMode) => {
        setMode(nextMode);
        setMessage(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            if (mode === "login") {
                const credentials: LoginInfo = {
                    email: formData.email,
                    password: formData.password,
                };
                const session = await login(credentials);
                onAuthenticated(session);
                onClose();
                return;
            }

            await signup(formData);
            const session = await login({ email: formData.email, password: formData.password });
            onAuthenticated(session);
            onClose();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Authentication failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClassName = "w-full rounded-lg border border-white/10 bg-[#071218]/75 px-11 py-3 text-sm text-white outline-none transition focus:border-cyan-400/70 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.12)] placeholder:text-slate-500";
    const iconClassName = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-300/80";

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#010507]/55 px-4 backdrop-blur-sm">
            <section className="relative w-full max-w-[440px] border border-cyan-300/20 bg-[#031016]/85 p-6 shadow-[0_0_45px_rgba(0,229,255,0.18),0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-300 transition hover:border-cyan-300/50 hover:text-white"
                    aria-label="Close authentication panel"
                >
                    <X size={18} />
                </button>

                <div className="mb-6 pr-10">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_18px_rgba(0,229,255,0.2)]">
                        <LockKeyhole size={21} />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-normal text-white">
                        {mode === "login" ? "Access city systems" : "Create access profile"}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        {mode === "login" ? "Sign in to load protected city data." : "Join the digital twin workspace."}
                    </p>
                </div>

                <div className="mb-5 grid grid-cols-2 rounded-lg border border-white/10 bg-black/20 p-1">
                    <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className={`rounded-md px-3 py-2 text-sm font-medium transition ${mode === "login" ? "bg-cyan-300 text-[#031016]" : "text-slate-300 hover:text-white"}`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className={`rounded-md px-3 py-2 text-sm font-medium transition ${mode === "signup" ? "bg-cyan-300 text-[#031016]" : "text-slate-300 hover:text-white"}`}
                    >
                        Signup
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {mode === "signup" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="relative block">
                                <UserRound size={17} className={iconClassName} />
                                <input
                                    className={inputClassName}
                                    value={formData.name}
                                    onChange={event => updateField("name", event.target.value)}
                                    placeholder="Name"
                                    autoComplete="given-name"
                                    required
                                />
                            </label>
                            <label className="relative block">
                                <UserRound size={17} className={iconClassName} />
                                <input
                                    className={inputClassName}
                                    value={formData.lastName}
                                    onChange={event => updateField("lastName", event.target.value)}
                                    placeholder="Last name"
                                    autoComplete="family-name"
                                    required
                                />
                            </label>
                        </div>
                    )}

                    <label className="relative block">
                        <Mail size={17} className={iconClassName} />
                        <input
                            className={inputClassName}
                            type="email"
                            value={formData.email}
                            onChange={event => updateField("email", event.target.value)}
                            placeholder="Email"
                            autoComplete="email"
                            required
                        />
                    </label>

                    {mode === "signup" && (
                        <label className="relative block">
                            <Phone size={17} className={iconClassName} />
                            <input
                                className={inputClassName}
                                value={formData.phoneNumber ?? ""}
                                onChange={event => updateField("phoneNumber", event.target.value)}
                                placeholder="Phone number"
                                autoComplete="tel"
                            />
                        </label>
                    )}

                    <label className="relative block">
                        <LockKeyhole size={17} className={iconClassName} />
                        <input
                            className={`${inputClassName} pr-12`}
                            type={isPasswordVisible ? "text" : "password"}
                            value={formData.password}
                            onChange={event => updateField("password", event.target.value)}
                            placeholder="Password"
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(current => !current)}
                            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:text-white"
                            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                        >
                            {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </label>

                    {mode === "signup" && (
                        <label className="relative block">
                            <LockKeyhole size={17} className={iconClassName} />
                            <input
                                className={inputClassName}
                                type={isPasswordVisible ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={event => updateField("confirmPassword", event.target.value)}
                                placeholder="Confirm password"
                                autoComplete="new-password"
                                required
                            />
                        </label>
                    )}

                    {message && (
                        <div className="border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-[#031016] shadow-[0_0_22px_rgba(0,229,255,0.25)] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
                    >
                        {isSubmitting && <Loader2 size={17} className="animate-spin" />}
                        {mode === "login" ? "Login" : "Create account"}
                    </button>
                </form>
            </section>
        </div>
    );
}
