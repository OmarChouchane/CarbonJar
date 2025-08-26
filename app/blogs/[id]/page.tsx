'use client';
import { useEffect, useState } from 'react';

import Footer from '@/components/footer';
import { H1, H2 } from '@/components/Heading';
import Page from '@/components/page';
import ScrollProgress from '@/components/scroll';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  authorId: string | null;
  publishDate: string | null;
  status: 'draft' | 'published';
};

export default function BlogDetail({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/blogposts/${params.id}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Failed to fetch blog post: ${res.status}`);
        const data = (await res.json()) as unknown as BlogPost | null;
        if (mounted) setPost(data);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load blog post');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  return (
    <Page>
      <ScrollProgress />
      <main>
        <div className="mx-auto py-12 sm:mt-4 sm:mb-4 sm:px-4 md:mt-4 md:mb-2 lg:mt-4 lg:px-6">
          {loading && <H2>Loading…</H2>}
          {!loading && error && <H2>{error}</H2>}
          {!loading && !error && post && (
            <article className="mx-auto max-w-4xl">
              <H1>{post.title}</H1>
              <div className="text-white-light mt-6 leading-7 whitespace-pre-wrap">
                {post.content}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </Page>
  );
}
