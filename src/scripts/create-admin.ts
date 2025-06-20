import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('开始创建管理员用户...');

    const email = 'admin@example.com';
    const password = 'admin123456';
    const hashedPassword = await hash(password, 12);

    // 检查是否已存在管理员用户
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('管理员用户已存在:', email);
      return;
    }

    // 创建管理员用户
    const admin = await prisma.user.create({
      data: {
        name: '系统管理员',
        email,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      }
    });

    console.log('管理员用户创建成功!');
    console.log('邮箱:', email);
    console.log('密码:', password);
    console.log('请在首次登录后修改密码');

  } catch (error) {
    console.error('创建管理员用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 