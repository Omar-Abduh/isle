export interface UserDTO {
  id: string
  email: string
  displayName: string
  timezone: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserDTO
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}
