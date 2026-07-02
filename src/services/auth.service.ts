import { api } from "@/lib/api";
import type { Token, User } from "@/types/auth";

export async function register(email: string, password: string): Promise<User> {
  const response = await api.post<User>("/auth/register", { email, password });
  return response.data;
}

export async function login(email: string, password: string): Promise<Token> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const response = await api.post<Token>("/auth/token", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export async function updateEmail(email: string): Promise<User> {
  const response = await api.patch<User>("/users/me/email", { email });
  return response.data;
}
