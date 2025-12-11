import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateDownloadUrl } from '@/lib/cloudinary';  // 新增导入

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/resources/[id]/download
 * 下载资源（需登录）
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;

        // 验证登录
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '请先登录后下载' },
                { status: 401 }
            );
        }

        // 查询资源
        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource || resource.status !== 'APPROVED') {
            return NextResponse.json(
                { success: false, error: '资源不存在' },
                { status: 404 }
            );
        }

        // 获取请求信息
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // 检查是否是重复下载（同一用户1小时内只计数1次）
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentDownload = await prisma.resourceDownload.findFirst({
            where: {
                resourceId: id,
                userId: session.user.id,
                createdAt: { gte: oneHourAgo },
            },
        });

        // 记录下载并更新计数
        if (!recentDownload) {
            await Promise.all([
                // 记录下载日志
                prisma.resourceDownload.create({
                    data: {
                        resourceId: id,
                        userId: session.user.id,
                        ip,
                        userAgent,
                    },
                }),
                // 增加下载次数
                prisma.resource.update({
                    where: { id },
                    data: { downloads: { increment: 1 } },
                }),
            ]);
        }

        // ========== 修改部分 ==========
        // 根据文件类型确定 resourceType
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
            resource.fileFormat?.toLowerCase() || ''
        )
        // PDF 在 Cloudinary 中作为 image 类型上传
        const isPdf = resource.fileFormat?.toLowerCase() === 'pdf'
        const resourceType = (isImage || isPdf) ? 'image' : 'raw'

        // 生成带 fl_attachment 的下载 URL
        const downloadUrl = generateDownloadUrl(
            resource.filePublicId,
            resource.fileName,
            resourceType
        )
        // ========== 修改结束 ==========

        // 返回下载URL
        return NextResponse.json({
            success: true,
            data: {
                downloadUrl,
                fileName: resource.fileName,
            },
        });

    } catch (error) {
        console.error('Download resource error:', error);
        return NextResponse.json(
            { success: false, error: '获取下载链接失败' },
            { status: 500 }
        );
    }
}