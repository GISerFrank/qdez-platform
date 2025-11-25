// src/types/qa.ts

import { PostStatus } from '@prisma/client'

// 问题类型
export interface Question {
    id: string
    title: string
    content: string
    authorId: string
    category: string
    solved: boolean                    // 🆕
    acceptedAnswerId: string | null    // 🆕
    views: number
    status: PostStatus
    createdAt: string
    updatedAt: string
    author: {
        id: string
        username: string
        name: string
        displayName: string | null
        avatarUrl: string | null
    }
    answers?: Answer[]
    acceptedAnswer?: Answer | null     // 🆕
    likeCount?: number
    answerCount?: number
    tags?: string[]
    isLiked?: boolean
}

// 答案类型
export interface Answer {
    id: string
    content: string
    questionId: string
    authorId: string
    isAccepted: boolean                // 🆕
    upvotes: number                    // 🆕
    downvotes: number                  // 🆕
    status: PostStatus
    createdAt: string
    updatedAt: string
    author: {
        id: string
        username: string
        name: string
        displayName: string | null
        avatarUrl: string | null
    }
    voteScore?: number                 // 🆕 upvotes - downvotes
    userVote?: 'UPVOTE' | 'DOWNVOTE' | null  // 🆕 当前用户的投票
    likeCount?: number
    isLiked?: boolean
}

// 投票类型
export type VoteType = 'UPVOTE' | 'DOWNVOTE'

// API响应类型
export interface QuestionListResponse {
    success: boolean
    data: {
        questions: Question[]
        total: number
        page: number
        totalPages: number
    }
}

export interface QuestionDetailResponse {
    success: boolean
    data: {
        question: Question
        isLiked: boolean
    }
}

export interface AnswerListResponse {
    success: boolean
    data: {
        answers: Answer[]
        total: number
    }
}

export interface VoteResponse {
    success: boolean
    data: {
        voteType: VoteType | null
        upvotes: number
        downvotes: number
        voteScore: number
    }
}

export interface AcceptAnswerResponse {
    success: boolean
    data: {
        question: Question
        answer: Answer
    }
}