import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, CreateUserDto, UpdateUserDto, User } from "./api.types";

export const api = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: "https://api.mecener.online/",
		prepareHeaders(headers) {
			headers.set("Content-Type", "application/json");
			headers.set("Authorization", "token");

			return headers;
		},
	}),
	endpoints: (builder) => ({
		getAllUsers: builder.query<ApiResponse<User[] | null>, void>({
			query: () => ({
				method: "GET",
				url: "users",
			}),
		}),
		getUserById: builder.query<ApiResponse<User | null>, { id: number }>({
			query: ({ id }) => ({
				method: "GET",
				url: "users/" + id,
			}),
		}),
		createUser: builder.mutation<ApiResponse<User | null>, CreateUserDto>({
			query: (dto) => ({
				method: "POST",
				url: "users",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(dto),
			}),
		}),
		updateUser: builder.mutation<ApiResponse<User | null>, { id: number; dto: UpdateUserDto }>({
			query: ({ id, dto }) => ({
				method: "PUT",
				url: "users/" + id,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(dto),
			}),
		}),
		deleteUser: builder.mutation<ApiResponse<null>, { id: number }>({
			query: ({ id }) => ({
				method: "DELETE",
				url: "users/" + id,
				headers: {
					"Content-Type": "application/json",
				},
			}),
		}),
	}),
});

export const {
	useGetAllUsersQuery,
	useLazyGetAllUsersQuery,
	useGetUserByIdQuery,
	useLazyGetUserByIdQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
} = api;
