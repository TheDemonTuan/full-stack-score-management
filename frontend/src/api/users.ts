interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
