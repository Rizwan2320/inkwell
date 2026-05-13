import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET /api/auth - Get current user session
export async function GET() {
  try {
    // Simple auth: get the first user as the "logged in" user
    let user = await db.user.findFirst();

    if (!user) {
      // Auto-create a default admin user with hashed password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      user = await db.user.create({
        data: {
          email: 'admin@inkwell.dev',
          name: 'Rizwan Khan',
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Error fetching auth:', error);
    return NextResponse.json({ error: 'Failed to fetch auth' }, { status: 500 });
  }
}

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if password matches - support both hashed and plain text
    let isValidPassword = false;

    // Try bcrypt first (for hashed passwords)
    if (user.password.startsWith('$2')) {
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Fallback to plain text (for backwards compatibility)
      isValidPassword = password === user.password;
    }

    // If valid and password was plain text, upgrade to hashed
    if (isValidPassword && !user.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}