import { z } from 'zod';

/**
 * 注册步骤1：基础账号信息（基础对象，不带 refine）
 */
const step1BaseSchema = z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    username: z
        .string()
        .min(3, '用户名至少3个字符')
        .max(20, '用户名最多20个字符')
        .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
    password: z
        .string()
        .min(8, '密码至少8个字符')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码必须包含字母和数字'),
    confirmPassword: z.string(),
    inviteCode: z.string().min(1, '邀请码不能为空'),
});

/**
 * 注册步骤1：基础账号信息（带密码一致性验证）
 * 用于前端单独验证第一步
 */
export const step1Schema = step1BaseSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: '两次输入的密码不一致',
        path: ['confirmPassword'],
    }
);

/**
 * 注册步骤2：二中身份信息
 */
export const step2Schema = z.object({
    name: z.string().min(2, '请输入真实姓名').max(50),
    qdezEnrollmentYear: z
        .number()
        .min(1980, '年份不合理')
        .max(new Date().getFullYear(), '年份不能是未来'),
    qdezGraduationYear: z
        .number()
        .min(1980)
        .max(new Date().getFullYear() + 10)
        .optional(),
    qdezClass: z.string().min(1, '请输入班级').max(50),
});

/**
 * 注册步骤3：留学信息
 */
export const step3Schema = z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    currentSchool: z.string().max(200).optional(),
    major: z.string().max(100).optional(),
    degree: z.enum(['本科', '硕士', '博士', '其他']).optional(),
    enrollmentYear: z.number().min(1980).max(2100).optional(),
    expectedGradYear: z.number().min(1980).max(2100).optional(),
});

/**
 * 注册步骤4：完善资料
 */
export const step4Schema = z.object({
    displayName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    wechat: z.string().max(100).optional(),
    linkedin: z
        .string()
        .url('请输入有效的 LinkedIn URL')
        .optional()
        .or(z.literal('')),
    website: z
        .string()
        .url('请输入有效的网址')
        .optional()
        .or(z.literal('')),
    privacySettings: z.object({
        profilePublic: z.boolean(),
        locationPublic: z.boolean(),
        contactPublic: z.boolean(),
        searchable: z.boolean(),
    }).optional(),
});

/**
 * 完整注册数据验证
 * 使用基础 schema（不带 refine）进行合并，然后在最后添加验证
 */
export const completeRegistrationSchema = step1BaseSchema
    .merge(step2Schema)
    .merge(step3Schema)
    .merge(step4Schema)
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: '两次输入的密码不一致',
            path: ['confirmPassword'],
        }
    );

/**
 * 类型导出
 */
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type CompleteRegistrationData = z.infer<typeof completeRegistrationSchema>;