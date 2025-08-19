"use client";
import { useEffect, useState } from "react";
import Page from "@/components/page";
import ScrollProgress from "@/components/scroll";
import { H1, H2 } from "@/components/Heading";
import Footer from "@/components/footer";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  authorId: string | null;
  publishDate: string | null;
  status: "draft" | "published";
};

export default function BlogDetail({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/blogposts/${params.id}`, {
          cache: "no-store",
        });
        if (!res.ok)
          throw new Error(`Failed to fetch blog post: ${res.status}`);
        const data: BlogPost | null = await res.json();
        if (mounted) setPost(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load blog post");
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
        <div className="mx-auto py-12 sm:px-4 lg:px-6 md:mb-2 sm:mb-4 lg:mt-4 md:mt-4 sm:mt-4">
          {loading && <H2>Loading…</H2>}
          {!loading && error && <H2>{error}</H2>}
          {!loading && !error && post && (
            <article className="max-w-4xl mx-auto">
              <H1>{post.title}</H1>
              <div className="mt-6 text-white-light leading-7 whitespace-pre-wrap">
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
