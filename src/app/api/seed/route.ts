import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// POST /api/seed - Seed the database with demo data
export async function POST() {
  try {
    // Check if data already exists
    const existingPosts = await db.post.count();
    if (existingPosts > 0) {
      return NextResponse.json({ message: 'Database already seeded', skipped: true });
    }

    // Get or create user with hashed password
    let user = await db.user.findFirst();
    if (!user) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      user = await db.user.create({
        data: {
          email: 'admin@inkwell.dev',
          name: 'Rizwan Khan',
          password: hashedPassword,
        },
      });
    }

    // Create categories
    const aiCategory = await db.category.create({
      data: {
        name: 'AI Engineering',
        description: 'Exploring artificial intelligence and machine learning',
        color: '#00FF00',
      },
    });

    const webCategory = await db.category.create({
      data: {
        name: 'Web Development',
        description: 'Modern web technologies and frameworks',
        color: '#00aaff',
      },
    });

    const devopsCategory = await db.category.create({
      data: {
        name: 'DevOps',
        description: 'CI/CD, infrastructure, and deployment',
        color: '#ffaa00',
      },
    });

    // Create sample posts
    const posts = [
      {
        title: 'Building Intelligent Agents with LangChain',
        content: `## Introduction\n\nThe rise of large language models has opened up incredible possibilities for building intelligent agents that can reason, plan, and execute complex tasks. LangChain provides a powerful framework for orchestrating these agents.\n\n## What are Agents?\n\nAgents are autonomous systems that use LLMs to determine which actions to take and in what order. Unlike simple chains, agents can:\n\n- **Reason** about complex problems\n- **Plan** multi-step strategies\n- **Execute** actions using tools\n- **Observe** and adapt based on results\n\n## Getting Started\n\nHere's a simple example of creating a ReAct agent:\n\n\`\`\`python\nfrom langchain.agents import create_react_agent\nfrom langchain_openai import ChatOpenAI\n\nllm = ChatOpenAI(model="gpt-4")\nagent = create_react_agent(llm, tools, prompt)\n\`\`\`\n\n## Key Components\n\n1. **LLM** - The brain of the agent\n2. **Tools** - Functions the agent can call\n3. **Memory** - Context from previous interactions\n4. **Prompt Templates** - Instructions for the agent\n\n## Best Practices\n\n- Always set reasonable timeout limits\n- Implement fallback strategies\n- Monitor agent behavior in production\n- Use structured outputs when possible\n\n## Conclusion\n\nBuilding intelligent agents is one of the most exciting frontiers in AI engineering. With frameworks like LangChain, it's becoming increasingly accessible to create production-ready agent systems.`,
        excerpt: 'Learn how to build intelligent agents using LangChain framework with practical examples and best practices.',
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
        categoryId: aiCategory.id,
        authorId: user.id,
        slug: 'building-intelligent-agents-langchain',
      },
      {
        title: 'Next.js 16: The Future of React Frameworks',
        content: `## What's New in Next.js 16\n\nNext.js 16 brings a host of improvements that make building modern web applications even more delightful. Let's explore the key features.\n\n## Enhanced App Router\n\nThe App Router has been significantly improved with:\n\n- **Faster navigation** with improved prefetching\n- **Better streaming** for progressive rendering\n- **Enhanced caching** strategies\n\n## Server Components Evolution\n\nReact Server Components are now more powerful than ever:\n\n\`\`\`tsx\n// This component runs entirely on the server\nexport default async function BlogPost({ id }: Props) {\n  const post = await getPost(id);\n  return <article>{post.content}</article>;\n}\n\`\`\`\n\n## Performance Improvements\n\n- 30% faster compilation times\n- Reduced bundle sizes\n- Improved Core Web Vitals scores\n\n## Migration Guide\n\nUpgrading from Next.js 15 is straightforward. Most applications will work with minimal changes.\n\n## Conclusion\n\nNext.js 16 represents a significant step forward in the React ecosystem, making it easier than ever to build performant, scalable applications.`,
        excerpt: 'Explore the groundbreaking features in Next.js 16 and how they transform modern web development.',
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        categoryId: webCategory.id,
        authorId: user.id,
        slug: 'nextjs-16-future-react-frameworks',
      },
      {
        title: 'Deploying ML Models at Scale with Kubernetes',
        content: `## The Challenge of ML Deployment\n\nDeploying machine learning models at scale presents unique challenges that traditional web applications don't face. From GPU scheduling to model versioning, there's a lot to consider.\n\n## Why Kubernetes?\n\nKubernetes provides the perfect foundation for ML workloads:\n\n- **Auto-scaling** based on inference demand\n- **GPU scheduling** for compute-intensive models\n- **Rolling updates** for zero-downtime deployments\n- **Resource isolation** for multi-tenant environments\n\n## Architecture Overview\n\nA typical ML deployment on K8s includes:\n\n1. **Model Server** - Handles inference requests\n2. **Feature Store** - Manages ML features\n3. **Model Registry** - Tracks model versions\n4. **Monitoring Stack** - Observes model performance\n\n## Best Practices\n\n- Use model quantization for faster inference\n- Implement circuit breakers for reliability\n- Set up A/B testing for model rollouts\n- Monitor data drift in production\n\n## Conclusion\n\nKubernetes has become the de facto standard for deploying ML models at scale, providing the flexibility and reliability needed for production AI systems.`,
        excerpt: 'A comprehensive guide to deploying machine learning models at scale using Kubernetes and modern DevOps practices.',
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop',
        categoryId: devopsCategory.id,
        authorId: user.id,
        slug: 'deploying-ml-models-scale-kubernetes',
      },
      {
        title: 'Understanding Transformer Architecture',
        content: `## The Foundation of Modern AI\n\nThe Transformer architecture, introduced in the seminal "Attention Is All You Need" paper, has become the backbone of modern AI systems.\n\n## Self-Attention Mechanism\n\nThe key innovation is the self-attention mechanism:\n\n- **Query** - What the token is looking for\n- **Key** - What the token represents\n- **Value** - The actual information content\n\n\`\`\`python\nattention = softmax(Q @ K.T / sqrt(d_k)) @ V\n\`\`\`\n\n## Multi-Head Attention\n\nMultiple attention heads allow the model to attend to different aspects of the input simultaneously.\n\n## Positional Encoding\n\nSince transformers don't have inherent sequence awareness, positional encodings inject order information.\n\n## Conclusion\n\nUnderstanding transformers is essential for anyone working in AI. This architecture underpins everything from GPT to BERT to the latest multimodal models.`,
        excerpt: 'Deep dive into the Transformer architecture that powers modern AI systems like GPT and BERT.',
        published: true,
        coverImage: null,
        categoryId: aiCategory.id,
        authorId: user.id,
        slug: 'understanding-transformer-architecture',
      },
      {
        title: 'Draft: Rust for Systems Programming',
        content: `## Why Rust?\n\nRust offers memory safety without garbage collection, making it ideal for systems programming.\n\nThis is a work in progress...`,
        excerpt: 'Exploring Rust for systems-level programming and its advantages over C/C++.',
        published: false,
        coverImage: null,
        categoryId: devopsCategory.id,
        authorId: user.id,
        slug: 'rust-systems-programming',
      },
    ];

    for (const post of posts) {
      await db.post.create({ data: post });
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      user: { id: user.id, name: user.name },
      categories: 3,
      posts: posts.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
