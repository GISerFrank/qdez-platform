# 阶段四：问答系统 - 完整实现方案

## 📋 概述

基于已完成的论坛系统，实现问答系统（Q&A）。由于论坛和问答的数据结构和交互逻辑高度相似，我们可以复用约**70%的代码**，只需新增问答特有的功能。

---

## 🔄 代码复用策略

### 完全复用（无需修改）

这些文件可以直接复用，无需任何修改：

1. **工具函数** (`src/lib/forum/utils.ts`)
   - `calculateOffset()` - 分页偏移计算
   - `generatePaginationMeta()` - 分页元数据生成
   - `formatAuthor()` - 作者信息格式化
   - `formatDate()` - 日期格式化

2. **认证逻辑**
   - NextAuth session获取
   - 用户权限验证
   - 作者身份检查

3. **数据库操作模式**
   - Prisma查询模式
   - 事务处理
   - 关联查询（include/select）

### 复制并修改（改字段名）

这些代码需要复制，但只需修改字段名即可：

| 论坛文件 | 问答文件 | 主要改动 |
|---------|---------|---------|
| `src/lib/forum/validation.ts` | `src/lib/qa/validation.ts` | `Post` → `Question`, `Comment` → `Answer` |
| `src/app/api/forum/posts/route.ts` | `src/app/api/qa/questions/route.ts` | 表名改为 `question` |
| `src/app/api/forum/posts/[id]/route.ts` | `src/app/api/qa/questions/[id]/route.ts` | 添加 `solved`、`acceptedAnswerId` 字段 |
| `src/app/api/forum/posts/[id]/comments/route.ts` | `src/app/api/qa/questions/[id]/answers/route.ts` | 表名改为 `answer` |

### 需要新增的功能（30%新代码）

1. **采纳最佳答案** - 全新功能
2. **投票系统（赞同/反对）** - 全新功能
3. **问题状态筛选** - 在列表API中增加逻辑
4. **答案排序逻辑** - 采纳的答案置顶

---

## 📁 完整文件结构

```
src/
├── types/
│   ├── forum.ts                              # 已有
│   └── qa.ts                                 # 🆕 问答类型定义
├── lib/
│   ├── forum/
│   │   ├── validation.ts                     # 已有
│   │   └── utils.ts                          # 已有（问答复用）
│   └── qa/
│       └── validation.ts                     # 🆕 问答验证schemas
└── app/
    └── api/
        ├── forum/                             # 已有
        └── qa/                                # 🆕 问答API
            ├── questions/
            │   ├── route.ts                   # 🔄 复用posts/route.ts
            │   └── [id]/
            │       ├── route.ts               # 🔄 复用posts/[id]/route.ts
            │       ├── accept/
            │       │   └── route.ts           # 🆕 采纳答案
            │       └── answers/
            │           └── route.ts           # 🔄 复用comments/route.ts
            └── answers/
                └── [id]/
                    ├── route.ts               # 🔄 复用comments/[id]/route.ts
                    └── vote/
                        └── route.ts           # 🆕 投票功能
```

---

## 🗄️ 数据库Schema更新

### 需要添加的表

```prisma
// questions 表（基于 posts 表）
model Question {
  id               String    @id @default(cuid())
  title            String    @db.VarChar(200)
  content          String    @db.Text
  authorId         String    @map("author_id")
  category         String    @db.VarChar(50)
  
  // 🆕 问答特有字段
  solved           Boolean   @default(false)                      // 是否已解决
  acceptedAnswerId String?   @unique @map("accepted_answer_id")   // 采纳的答案ID
  
  views            Int       @default(0)
  status           PostStatus @default(ACTIVE)
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  author         User            @relation(fields: [authorId], references: [id], onDelete: Cascade)
  answers        Answer[]        @relation("QuestionAnswers")
  acceptedAnswer Answer?         @relation("AcceptedAnswer", fields: [acceptedAnswerId], references: [id])
  likes          QuestionLike[]
  tags           QuestionTag[]

  @@index([authorId])
  @@index([category])
  @@index([solved])      // 🆕 用于筛选
  @@index([createdAt])
  @@map("questions")
}

// answers 表（基于 comments 表）
model Answer {
  id         String     @id @default(cuid())
  content    String     @db.Text
  questionId String     @map("question_id")
  authorId   String     @map("author_id")
  
  // 🆕 问答特有字段
  isAccepted Boolean    @default(false)      // 是否被采纳
  upvotes    Int        @default(0)          // 赞同数
  downvotes  Int        @default(0)          // 反对数
  
  status     PostStatus @default(ACTIVE)
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime   @updatedAt @map("updated_at")

  question          Question             @relation("QuestionAnswers", fields: [questionId], references: [id], onDelete: Cascade)
  acceptedByQuestion Question?           @relation("AcceptedAnswer")
  author            User                 @relation(fields: [authorId], references: [id], onDelete: Cascade)
  votes             AnswerVote[]         // 🆕 投票记录
  likes             AnswerLike[]

  @@index([questionId])
  @@index([authorId])
  @@index([isAccepted])    // 🆕 用于排序
  @@map("answers")
}

// 🆕 投票表
model AnswerVote {
  id        String   @id @default(cuid())
  answerId  String   @map("answer_id")
  userId    String   @map("user_id")
  voteType  VoteType @map("vote_type")
  createdAt DateTime @default(now()) @map("created_at")

  answer Answer @relation(fields: [answerId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([answerId, userId])  // 一个用户对一个答案只能投一票
  @@map("answer_votes")
}

enum VoteType {
  UPVOTE
  DOWNVOTE
}

// 点赞和标签表（复用论坛结构，只改表名）
model QuestionLike {
  id         String   @id @default(cuid())
  questionId String   @map("question_id")
  userId     String   @map("user_id")
  createdAt  DateTime @default(now()) @map("created_at")

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([questionId, userId])
  @@map("question_likes")
}

model AnswerLike {
  id        String   @id @default(cuid())
  answerId  String   @map("answer_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  answer Answer @relation(fields: [answerId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([answerId, userId])
  @@map("answer_likes")
}

model QuestionTag {
  id         String   @id @default(cuid())
  questionId String   @map("question_id")
  tagId      String   @map("tag_id")
  createdAt  DateTime @default(now()) @map("created_at")

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  tag      Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([questionId, tagId])
  @@map("question_tags")
}
```

### User模型需要添加的关联

```prisma
model User {
  // ... 已有字段

  // 🆕 问答关联
  questions       Question[]
  answers         Answer[]
  answerVotes     AnswerVote[]
  questionLikes   QuestionLike[]
  answerLikes     AnswerLike[]
}
```

---

## 🆕 需要新增的代码

### 1. 类型定义 (`src/types/qa.ts`)

```typescript
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
```

### 2. 验证Schemas (`src/lib/qa/validation.ts`)

```typescript
// src/lib/qa/validation.ts
// 问答系统的 Zod 验证 schemas

import { z } from 'zod'
import { PostStatus } from '@prisma/client'

// ==========================================
// 问题验证
// ==========================================

// 创建问题验证（复用 createPostSchema）
export const createQuestionSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题最多200字符')
    .trim(),
  
  content: z
    .string()
    .min(1, '内容不能为空')
    .max(50000, '内容最多50000字符'),
  
  category: z
    .string()
    .min(1, '请选择分类'),
  
  tags: z
    .array(z.string().max(50, '标签名称最多50字符'))
    .max(5, '最多添加5个标签')
    .optional()
    .default([]),
})

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>

// 更新问题验证（复用 updatePostSchema）
export const updateQuestionSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题最多200字符')
    .trim()
    .optional(),
  
  content: z
    .string()
    .min(1, '内容不能为空')
    .max(50000, '内容最多50000字符')
    .optional(),
  
  category: z
    .string()
    .min(1, '请选择分类')
    .optional(),
  
  tags: z
    .array(z.string().max(50))
    .max(5, '最多添加5个标签')
    .optional(),
})

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>

// ==========================================
// 答案验证
// ==========================================

// 创建答案验证（复用 createCommentSchema，去掉 parentId）
export const createAnswerSchema = z.object({
  content: z
    .string()
    .min(1, '答案内容不能为空')
    .max(5000, '答案最多5000字符')
    .trim(),
})

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>

// 更新答案验证
export const updateAnswerSchema = z.object({
  content: z
    .string()
    .min(1, '答案内容不能为空')
    .max(5000, '答案最多5000字符')
    .trim(),
})

export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>

// ==========================================
// 投票验证
// ==========================================

export const voteSchema = z.object({
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
})

export type VoteInput = z.infer<typeof voteSchema>

// ==========================================
// 查询参数验证
// ==========================================

// 问题列表查询参数验证
export const questionListQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default('1'),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .default('20'),
  
  category: z
    .string()
    .optional(),
  
  sort: z
    .enum(['latest', 'hot', 'mostAnswered', 'unanswered'])
    .default('latest'),
  
  solved: z
    .string()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
    .optional(),  // 🆕 筛选已解决/未解决
  
  tag: z
    .string()
    .optional(),
})

export type QuestionListQuery = z.infer<typeof questionListQuerySchema>

// 答案列表查询参数验证
export const answerListQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default('1'),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('50'),
  
  sort: z
    .enum(['latest', 'votes'])  // 🆕 按投票数排序
    .default('votes'),
})

export type AnswerListQuery = z.infer<typeof answerListQuerySchema>

// ID参数验证
export const idParamSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
})

export type IdParam = z.infer<typeof idParamSchema>
```

### 3. 采纳答案API (`src/app/api/qa/questions/[id]/accept/route.ts`)

```typescript
// src/app/api/qa/questions/[id]/accept/route.ts
// 采纳最佳答案 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { idParamSchema } from '@/lib/qa/validation'
import { z } from 'zod'

// 请求体验证
const acceptAnswerSchema = z.object({
  answerId: z.string().cuid('Invalid answer ID'),
})

/**
 * POST /api/qa/questions/[id]/accept
 * 采纳最佳答案
 * 
 * 权限：只有提问者可以采纳答案
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const currentUserId = session.user.id

    // 2. 验证问题ID
    const paramResult = idParamSchema.safeParse(params)
    
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid question ID',
        },
        { status: 400 }
      )
    }

    const { id: questionId } = paramResult.data

    // 3. 解析请求体
    const body = await request.json()
    const bodyResult = acceptAnswerSchema.safeParse(body)

    if (!bodyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: bodyResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { answerId } = bodyResult.data

    // 4. 查询问题（验证提问者身份）
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        authorId: true,
        solved: true,
        acceptedAnswerId: true,
      },
    })

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question not found',
        },
        { status: 404 }
      )
    }

    // 5. 验证权限：只有提问者可以采纳答案
    if (question.authorId !== currentUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only the question author can accept an answer',
        },
        { status: 403 }
      )
    }

    // 6. 验证答案是否属于该问题
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        id: true,
        questionId: true,
        authorId: true,
      },
    })

    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Answer not found',
        },
        { status: 404 }
      )
    }

    if (answer.questionId !== questionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Answer does not belong to this question',
        },
        { status: 400 }
      )
    }

    // 7. 使用事务更新问题和答案状态
    const result = await prisma.$transaction(async (tx) => {
      // 如果之前有采纳的答案，取消它
      if (question.acceptedAnswerId) {
        await tx.answer.update({
          where: { id: question.acceptedAnswerId },
          data: { isAccepted: false },
        })
      }

      // 更新新的采纳答案
      const updatedAnswer = await tx.answer.update({
        where: { id: answerId },
        data: { isAccepted: true },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      })

      // 更新问题状态为已解决
      const updatedQuestion = await tx.question.update({
        where: { id: questionId },
        data: {
          solved: true,
          acceptedAnswerId: answerId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              answers: true,
              likes: true,
            },
          },
        },
      })

      // TODO: 奖励被采纳答案的作者积分
      // await tx.user.update({
      //   where: { id: answer.authorId },
      //   data: { points: { increment: 50 } },
      // })

      return { updatedQuestion, updatedAnswer }
    })

    // 8. 格式化响应
    const formattedQuestion = {
      ...result.updatedQuestion,
      createdAt: result.updatedQuestion.createdAt.toISOString(),
      updatedAt: result.updatedQuestion.updatedAt.toISOString(),
      likeCount: result.updatedQuestion._count.likes,
      answerCount: result.updatedQuestion._count.answers,
    }

    const formattedAnswer = {
      ...result.updatedAnswer,
      createdAt: result.updatedAnswer.createdAt.toISOString(),
      updatedAt: result.updatedAnswer.updatedAt.toISOString(),
    }

    // 9. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        question: formattedQuestion,
        answer: formattedAnswer,
      },
    })
  } catch (error) {
    console.error('Accept answer error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
```

### 4. 投票API (`src/app/api/qa/answers/[id]/vote/route.ts`)

```typescript
// src/app/api/qa/answers/[id]/vote/route.ts
// 答案投票 API（赞同/反对）

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next/auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { idParamSchema, voteSchema } from '@/lib/qa/validation'

/**
 * POST /api/qa/answers/[id]/vote
 * 对答案投票（赞同/反对）
 * 
 * 逻辑：
 * - 如果用户未投票 → 添加投票
 * - 如果用户已投同类票 → 取消投票
 * - 如果用户已投异类票 → 切换投票类型
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const currentUserId = session.user.id

    // 2. 验证答案ID
    const paramResult = idParamSchema.safeParse(params)
    
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid answer ID',
        },
        { status: 400 }
      )
    }

    const { id: answerId } = paramResult.data

    // 3. 解析请求体
    const body = await request.json()
    const bodyResult = voteSchema.safeParse(body)

    if (!bodyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid vote type',
          details: bodyResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { voteType } = bodyResult.data

    // 4. 检查答案是否存在
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        id: true,
        upvotes: true,
        downvotes: true,
      },
    })

    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Answer not found',
        },
        { status: 404 }
      )
    }

    // 5. 查询用户当前的投票状态
    const existingVote = await prisma.answerVote.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId: currentUserId,
        },
      },
    })

    // 6. 使用事务处理投票逻辑
    const result = await prisma.$transaction(async (tx) => {
      let newVoteType: 'UPVOTE' | 'DOWNVOTE' | null = voteType
      let upvoteDelta = 0
      let downvoteDelta = 0

      if (!existingVote) {
        // 情况1：用户未投票 → 添加投票
        await tx.answerVote.create({
          data: {
            answerId,
            userId: currentUserId,
            voteType,
          },
        })

        if (voteType === 'UPVOTE') {
          upvoteDelta = 1
        } else {
          downvoteDelta = 1
        }
      } else if (existingVote.voteType === voteType) {
        // 情况2：用户已投同类票 → 取消投票
        await tx.answerVote.delete({
          where: {
            answerId_userId: {
              answerId,
              userId: currentUserId,
            },
          },
        })

        if (voteType === 'UPVOTE') {
          upvoteDelta = -1
        } else {
          downvoteDelta = -1
        }

        newVoteType = null
      } else {
        // 情况3：用户已投异类票 → 切换投票类型
        await tx.answerVote.update({
          where: {
            answerId_userId: {
              answerId,
              userId: currentUserId,
            },
          },
          data: {
            voteType,
          },
        })

        if (voteType === 'UPVOTE') {
          upvoteDelta = 1
          downvoteDelta = -1
        } else {
          upvoteDelta = -1
          downvoteDelta = 1
        }
      }

      // 更新答案的投票计数
      const updatedAnswer = await tx.answer.update({
        where: { id: answerId },
        data: {
          upvotes: { increment: upvoteDelta },
          downvotes: { increment: downvoteDelta },
        },
        select: {
          upvotes: true,
          downvotes: true,
        },
      })

      return {
        voteType: newVoteType,
        upvotes: updatedAnswer.upvotes,
        downvotes: updatedAnswer.downvotes,
      }
    })

    // 7. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        voteType: result.voteType,
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        voteScore: result.upvotes - result.downvotes,
      },
    })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
```

---

## 🔄 需要复制并修改的API示例

### 问题列表API (`src/app/api/qa/questions/route.ts`)

基于 `src/app/api/forum/posts/route.ts`，主要改动：

```typescript
// 主要改动点：

// 1. 导入改为问答相关
import { createQuestionSchema, questionListQuerySchema } from '@/lib/qa/validation'

// 2. 数据库表名改为 question
const questions = await prisma.question.findMany({
  // ...
})

// 3. 添加 solved 筛选
const where = {
  status: 'ACTIVE',
  ...(category && { category }),
  ...(tag && { tags: { some: { tag: { name: tag } } } }),
  ...(typeof solved === 'boolean' && { solved }),  // 🆕 新增筛选
}

// 4. 添加 unanswered 排序
const orderBy = 
  sort === 'unanswered' 
    ? [{ answers: { _count: 'asc' } }, { createdAt: 'desc' }]  // 🆕
    : sort === 'hot'
    ? [{ views: 'desc' }, { likeCount: 'desc' }]
    : sort === 'mostAnswered'
    ? [{ answers: { _count: 'desc' } }]  // 🆕
    : { createdAt: 'desc' }

// 其他逻辑完全相同
```

### 答案列表API (`src/app/api/qa/questions/[id]/answers/route.ts`)

基于 `src/app/api/forum/posts/[id]/comments/route.ts`，主要改动：

```typescript
// 主要改动点：

// 1. 表名改为 answer
const answers = await prisma.answer.findMany({
  where: {
    questionId,
    // 🆕 问答没有嵌套回复，去掉 parentId 过滤
  },
  // ...
})

// 2. 排序逻辑改为采纳优先 + 投票数
const orderBy = [
  { isAccepted: 'desc' as const },           // 🆕 采纳的答案永远在最上面
  { upvotes: 'desc' as const },              // 🆕 然后按赞同数
  { createdAt: 'desc' as const },            // 最后按时间
]

// 3. 查询用户的投票状态（而不是点赞状态）
if (currentUserId) {
  const votes = await prisma.answerVote.findMany({
    where: {
      answerId: { in: answerIds },
      userId: currentUserId,
    },
    select: {
      answerId: true,
      voteType: true,  // 🆕
    },
  })

  votedAnswers = new Map(votes.map(v => [v.answerId, v.voteType]))
}

// 4. 返回数据中添加投票信息
const formattedAnswers = answers.map(answer => ({
  ...answer,
  voteScore: answer.upvotes - answer.downvotes,  // 🆕
  userVote: votedAnswers.get(answer.id) || null,  // 🆕
  // ...
}))
```

---

## ⚡ 开发步骤

### 第1步：更新数据库（30分钟）

```bash
# 1. 更新 prisma/schema.prisma
# 2. 生成迁移
pnpm db:generate
pnpm db:push

# 3. 验证表创建
docker exec qdez-postgres psql -U postgres -d qdez_alumni -c "\dt"
```

### 第2步：创建类型和验证（30分钟）

1. 创建 `src/types/qa.ts`
2. 创建 `src/lib/qa/validation.ts`
3. 复用 `src/lib/forum/utils.ts`（无需修改）

### 第3步：创建API（3-4小时）

**优先级顺序**：

1. **问题CRUD** (1小时)
   - `GET/POST /api/qa/questions`
   - `GET/PUT/DELETE /api/qa/questions/[id]`

2. **答案CRUD** (1小时)
   - `GET/POST /api/qa/questions/[id]/answers`
   - `PUT/DELETE /api/qa/answers/[id]`

3. **采纳答案** (30分钟)
   - `POST /api/qa/questions/[id]/accept`

4. **投票功能** (1小时)
   - `POST /api/qa/answers/[id]/vote`

5. **点赞功能** (30分钟)
   - `POST /api/qa/questions/[id]/like`
   - `POST /api/qa/answers/[id]/like`

### 第4步：测试API（1小时）

使用Postman或浏览器测试所有端点。

---

## 📝 完成后的功能清单

- [ ] 用户可以发布问题
- [ ] 用户可以浏览问题列表
- [ ] 用户可以查看问题详情
- [ ] 用户可以回答问题
- [ ] 用户可以对答案投票（赞同/反对）
- [ ] 提问者可以采纳最佳答案
- [ ] 问题自动标记为已解决
- [ ] 采纳的答案置顶显示
- [ ] 答案按投票数排序
- [ ] 可以筛选已解决/未解决的问题

---

## 🎯 与论坛的关键差异总结

| 功能 | 论坛 | 问答 |
|------|------|------|
| **主体** | Post（帖子） | Question（问题） |
| **回复** | Comment（评论，支持嵌套） | Answer（答案，不支持嵌套） |
| **状态** | 无 | solved（已解决/未解决） |
| **最佳标记** | 无 | acceptedAnswer（采纳答案） |
| **互动** | 点赞 | 点赞 + 投票（赞同/反对） |
| **排序** | 时间、热度、点赞 | **采纳优先** + 投票数 + 时间 |
| **筛选** | 分类、标签 | 分类、标签、**已解决/未解决** |

---

准备好开始了吗？告诉我你想从哪一步开始！

1. ✅ 更新数据库Schema
2. 🔧 创建类型定义和验证
3. 📝 创建API路由
4. 🧪 测试功能
