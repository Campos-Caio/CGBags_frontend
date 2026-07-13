export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
