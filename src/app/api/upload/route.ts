import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const taskId = formData.get('taskId') as string | null;

  if (!file || !taskId) {
    return NextResponse.json({ error: 'file and taskId are required' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 15MB limit' }, { status: 413 });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadFile(buffer, `epm-platform/${task.projectId}`);

  const attachment = await prisma.attachment.create({
    data: {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      fileName: file.name,
      fileType: file.type,
      fileSize: uploaded.bytes,
      taskId,
      uploaderId: session.user.id,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}
