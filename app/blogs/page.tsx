"use client";

import { useEffect, useMemo, useState } from "react";
import Page from "@/components/page";
import ScrollProgress from "@/components/scroll";
import { H1, H2, H1Inter } from "@/components/Heading";
import Footer from "@/components/footer";
// No per-post pages; single feed

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  authorId: string | null;
  publishDate: string | null;
  status: "draft" | "published";
  createdAt?: string | null;
  updatedAt?: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getExcerpt(text: string | null, len = 160) {
  if (!text) return "";
  const t = text
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= len) return t;
  return t.slice(0, len).trimEnd() + "…";
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/blogposts", { cache: "no-store" });
        if (!res.ok)
          throw new Error(`Failed to fetch blog posts: ${res.status}`);
        const data: BlogPost[] = await res.json();
        if (mounted) setPosts(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load blog posts");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const published = useMemo(
    () =>
      posts
        .filter((p) => p.status === "published")
        .sort((a, b) => {
          const da = a.publishDate ? new Date(a.publishDate).getTime() : 0;
          const db = b.publishDate ? new Date(b.publishDate).getTime() : 0;
          return db - da;
        }),
    [posts]
  );

  return (
    <Page>
      <ScrollProgress />
      <main>
        <header>
          <div className="mx-auto py-12 px-4 sm:px-6 lg:px-8 md:mb-2 sm:mb-4 lg:mt-4 md:mt-4 sm:mt-4">
            <br />
            <H1 className="text-left">Blogs & Insights</H1>
            <br />
            <H2 className="text-left">
              Latest articles, updates, and insights from the Carbon Jar team.
            </H2>
          </div>
        </header>

        <section className="w-full py-8 md:py-10 lg:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading && (
              <div className="flex items-start py-12">
                <H2 className="text-green text-left">Loading posts…</H2>
              </div>
            )}
            {!loading && error && (
              <div className="flex flex-col items-start py-12">
                <H2 className="text-green text-left">{error}</H2>
              </div>
            )}
            {!loading && !error && (
              <>
                {published.length === 0 ? (
                  <div className="flex flex-col items-start py-12">
                    <H2 className="text-green text-left">No posts yet.</H2>
                  </div>
                ) : (
                  <div className="divide-y divide-lighter-green border-t border-lighter-green">
                    {published.map((p) => (
                      <article key={p.id} className="py-6">
                        <header className="mb-2">
                          <H1Inter className="text-green text-xl leading-7">
                            {p.title}
                          </H1Inter>
                          <div className="text-green/70 text-xs mt-1">
                            {formatDate(p.publishDate)}
                          </div>
                        </header>
                        <div className="text-green text-sm text-left leading-6">
                          {expanded[p.id]
                            ? p.content?.replace(/<[^>]+>/g, "") || ""
                            : getExcerpt(p.content)}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-Inter text-green/60 text-xs">
                            {p.slug}
                          </span>
                          <button
                            type="button"
                            className="text-green font-Inter text-sm hover:underline"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [p.id]: !prev[p.id],
                              }))
                            }
                          >
                            {expanded[p.id] ? "Show less" : "Read more"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </Page>
  );
}
