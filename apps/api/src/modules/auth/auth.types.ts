export interface RegisterInput {
  storeName: string
  storeSlug: string
  ownerName: string
  phone: string
  password: string
}

export interface LoginInput {
  phone: string
  password: string
  storeSlug: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    role: string
  }
  store: {
    id: string
    name: string
    slug: string
  }
  tokens: AuthTokens
}
