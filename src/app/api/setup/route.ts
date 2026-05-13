import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// POST /api/setup - Create tables and seed database
// Call this after deployment: curl -X POST https://your-app.vercel.app/api/setup
export async function POST() {
  try {
    // Check if tables already exist
    try {
      const userCount = await db.user.count();
      if (userCount > 0) {
        return NextResponse.json({
          message: 'Database already set up and seeded',
          userCount,
          status: 'ready',
        });
      }
    } catch {
      // Tables don't exist - create them
    }

    // Create tables using raw SQL
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Category" (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        color TEXT NOT NULL DEFAULT '#4ade80',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Post" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        excerpt TEXT,
        published BOOLEAN NOT NULL DEFAULT false,
        "coverImage" TEXT,
        slug TEXT UNIQUE NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        "totalReadMs" INTEGER NOT NULL DEFAULT 0,
        "authorId" TEXT NOT NULL,
        "categoryId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"(id) ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    // Create indexes
    try {
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");`);
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Post_categoryId_idx" ON "Post"("categoryId");`);
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Post_published_idx" ON "Post"("published");`);
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Post_slug_idx" ON "Post"("slug");`);
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt" DESC);`);
    } catch {
      // Indexes may already exist, that's fine
    }

    // Seed data - hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.user.create({
      data: {
        id: 'cmp2go1600000qg6ignq598vc',
        email: 'admin@inkwell.dev',
        name: 'Rizwan Khan',
        password: hashedPassword,
      },
    });

    const categories = await Promise.all([
      db.category.create({
        data: {
          id: 'cmp2go1620001qg6iopow47c6',
          name: 'AI Engineering',
          description: 'Exploring artificial intelligence and machine learning',
          color: '#00FF00',
        },
      }),
      db.category.create({
        data: {
          id: 'cmp2go1630002qg6ivzy1r0nq',
          name: 'Web Development',
          description: 'Modern web technologies and frameworks',
          color: '#00aaff',
        },
      }),
      db.category.create({
        data: {
          id: 'cmp2go1640003qg6isx0j669k',
          name: 'DevOps',
          description: 'CI/CD, infrastructure, and deployment',
          color: '#ffaa00',
        },
      }),
    ]);

    const posts = [
      {
        id: 'cmp2go1670007qg6iuocaaxka',
        title: 'Next.js 16: The Future of React Frameworks',
        content: "## What's New in Next.js 16\n\nNext.js 16 brings a host of improvements that make building modern web applications even more delightful.\n\n## Enhanced App Router\n\nThe App Router has been significantly improved with:\n\n- **Faster navigation** with improved prefetching\n- **Better streaming** for progressive rendering\n- **Enhanced caching** strategies\n\n## Server Components Evolution\n\nReact Server Components are now more powerful than ever:\n\n```tsx\nexport default async function BlogPost({ id }: Props) {\n  const post = await getPost(id);\n  return <article>{post.content}</article>;\n}\n```\n\n## Performance Improvements\n\n- 30% faster compilation times\n- Reduced bundle sizes\n- Improved Core Web Vitals scores",
        excerpt: 'Explore the groundbreaking features in Next.js 16 and how they transform modern web development.',
        published: true,
        slug: 'nextjs-16-future-react-frameworks',
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        authorId: 'cmp2go1600000qg6ignq598vc',
        categoryId: categories[1].id,
      },
      {
        id: 'cmp2go1660005qg6izwtmzx37',
        title: 'Building Intelligent Agents with LangChain',
        content: '## Introduction\n\nThe rise of large language models has opened up incredible possibilities for building intelligent agents.\n\n## What are Agents?\n\nAgents are autonomous systems that use LLMs to determine which actions to take:\n\n- **Reason** about complex problems\n- **Plan** multi-step strategies\n- **Execute** actions using tools\n- **Observe** and adapt\n\n```python\nfrom langchain.agents import create_react_agent\nfrom langchain_openai import ChatOpenAI\n\nllm = ChatOpenAI(model="gpt-4")\nagent = create_react_agent(llm, tools, prompt)\n```',
        excerpt: 'Learn how to build intelligent agents using LangChain framework with practical examples.',
        published: true,
        slug: 'building-intelligent-agents-langchain',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
        authorId: 'cmp2go1600000qg6ignq598vc',
        categoryId: categories[0].id,
      },
      {
        id: 'cmp2go1680009qg6iy6zmhf1w',
        title: 'Deploying ML Models at Scale with Kubernetes',
        content: '## The Challenge of ML Deployment\n\nDeploying ML models at scale presents unique challenges.\n\n## Why Kubernetes?\n\n- **Auto-scaling** based on inference demand\n- **GPU scheduling** for compute-intensive models\n- **Rolling updates** for zero-downtime deployments\n- **Resource isolation** for multi-tenant environments\n\n## Architecture\n\n1. Model Server\n2. Feature Store\n3. Model Registry\n4. Monitoring Stack',
        excerpt: 'A comprehensive guide to deploying ML models at scale using Kubernetes.',
        published: true,
        slug: 'deploying-ml-models-scale-kubernetes',
        coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop',
        authorId: 'cmp2go1600000qg6ignq598vc',
        categoryId: categories[2].id,
      },
    ];

    for (const post of posts) {
      await db.post.create({ data: post });
    }

    return NextResponse.json({
      message: '✅ Database setup complete! Tables created and seeded.',
      tables: ['User', 'Category', 'Post'],
      user: 'admin@inkwell.dev',
      categories: categories.length,
      posts: posts.length,
      status: 'ready',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure DATABASE_URL points to your Supabase database and the connection is working.',
    }, { status: 500 });
  }
}

// GET /api/setup - Check setup status
export async function GET() {
  try {
    const userCount = await db.user.count();
    const postCount = await db.post.count();
    const categoryCount = await db.category.count();

    return NextResponse.json({
      status: userCount > 0 ? 'ready' : 'needs-seed',
      tables: {
        users: userCount,
        posts: postCount,
        categories: categoryCount,
      },
      nextStep: userCount > 0
        ? 'Database is ready! Visit your app.'
        : 'Call POST /api/setup to create tables and seed data.',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'needs-setup',
      error: 'Database tables not found',
      details: error instanceof Error ? error.message : 'Unknown error',
      nextStep: 'Call POST /api/setup to create tables and seed data.',
    }, { status: 400 });
  }
}
