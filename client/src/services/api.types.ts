export interface ApiResponse<T> {
	data?: T;
	message?: string;
	error?: string;
	statusCode: number;
}
export interface User {
	id: number;
	name: string;
	email: string;
	createdAt?: string;
	updatedAt?: string;
}
export interface CreateUserDto {
	name: string;
	email: string;
}
export interface UpdateUserDto {
	name?: string;
	email?: string;
}
export interface UsersDb {
	users: User[];
}
