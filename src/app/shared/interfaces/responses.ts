import { Comment, MyEvent } from "./my-event";
import { User } from "./user";

export interface EventsResponse {
    events: MyEvent[];
    more: boolean;
    page: number;
    count: number;
}

export interface SingleEventResponse {
    event: MyEvent;
}

export interface TokenResponse {
    accessToken: string;
}

export interface UserResponse {
    user: User;
}

export interface UsersResponse {
    users: User[];
}

export interface CommentsResponse {
    comments: Comment[];
}

export interface CommentResponse {
    comment: Comment;
}

export interface AttendeesResponse { 
    attendees: User[];
}