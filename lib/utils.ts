import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export enum ResultCode {
    InvalidCredentials = 'INVALID_CREDENTIALS',
    InvalidSubmission = 'INVALID_SUBMISSION',
    UserAlreadyExists = 'USER_ALREADY_EXISTS',
    UnknownError = 'UNKNOWN_ERROR',
    UserCreated = 'USER_CREATED',
    UserLoggedIn = 'USER_LOGGED_IN'
}
  
export const getMessageFromCode = (resultCode: string) => {
    switch (resultCode) {
        case ResultCode.InvalidCredentials:
            return 'Invalid credentials!'
        case ResultCode.InvalidSubmission:
            return 'Invalid submission, please try again!'
        case ResultCode.UserAlreadyExists:
            return 'User already exists, please log in!'
        case ResultCode.UserCreated:
            return 'User created, welcome!'
        case ResultCode.UnknownError:
            return 'Something went wrong, please try again!'
        case ResultCode.UserLoggedIn:
            return 'Logged in!'
    }
}


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    7
) // 7-character random string