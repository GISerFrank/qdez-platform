import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
    uploadToCloudinary,
    validateFileType,
    getMaxFileSize,
    getFileExtension
} from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        // 1. 验证登录
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '请先登录' },
                { status: 401 }
            );
        }

        // 2. 解析表单数据
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: '请选择文件' },
                { status: 400 }
            );
        }

        // 3. 验证文件类型
        if (!validateFileType(file.type)) {
            return NextResponse.json(
                { success: false, error: '不支持的文件类型' },
                { status: 400 }
            );
        }

        // 4. 验证文件大小
        const maxSize = getMaxFileSize(file.type);
        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    error: `文件大小超过限制（最大 ${Math.floor(maxSize / 1024 / 1024)}MB）`
                },
                { status: 400 }
            );
        }

        // 5. 读取文件内容
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 6. 上传到 Cloudinary
        const result = await uploadToCloudinary(
            buffer,
            file.name,
            file.type,
            {
                folder: `qdez-resources/${session.user.id}`,
                tags: ['resource', session.user.id],
            }
        );

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || '上传失败' },
                { status: 500 }
            );
        }

        // 7. 返回上传结果
        return NextResponse.json({
            success: true,
            data: {
                fileUrl: result.data!.secureUrl,
                filePublicId: result.data!.publicId,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileFormat: getFileExtension(file.type),
            },
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { success: false, error: '上传失败，请重试' },
            { status: 500 }
        );
    }
}