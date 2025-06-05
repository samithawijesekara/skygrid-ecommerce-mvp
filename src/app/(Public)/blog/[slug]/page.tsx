import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prismadb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, ImageIcon, ChevronLeft } from "lucide-react";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";
import { Suspense } from "react";
import { BlogPostSkeleton } from "@/components/loading-spinners/skelton-loaders";

interface Props {
  params: {
    slug: string;
  };
}

// Sanitize options for HTML content
const sanitizeOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "p",
    "a",
    "ul",
    "ol",
    "nl",
    "li",
    "b",
    "i",
    "strong",
    "em",
    "strike",
    "code",
    "hr",
    "br",
    "div",
    "table",
    "thead",
    "caption",
    "tbody",
    "tr",
    "th",
    "td",
    "pre",
    "img",
    "iframe",
  ],
  allowedAttributes: {
    a: ["href", "name", "target"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    iframe: [
      "src",
      "width",
      "height",
      "frameborder",
      "allow",
      "allowfullscreen",
    ],
    "*": ["class", "id", "style"],
  },
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
  // Preserve line breaks
  transformTags: {
    "*": function (tagName: string, attribs: { [key: string]: string }) {
      return {
        tagName,
        attribs,
      };
    },
  },
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  // Strip HTML tags for meta description
  const plainTextContent = blog.content.replace(/<[^>]+>/g, "");

  return {
    title: blog.title,
    description: plainTextContent.substring(0, 160),
    openGraph: {
      title: blog.title,
      description: plainTextContent.substring(0, 160),
      type: "article",
      ...(blog.coverImage && {
        images: [
          {
            url: `https://skybird-saas-boilerplate.s3.us-east-1.amazonaws.com/${blog.coverImage}`,
            width: 1200,
            height: 630,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: plainTextContent.substring(0, 160),
      ...(blog.coverImage && {
        images: [
          `https://skybird-saas-boilerplate.s3.us-east-1.amazonaws.com/${blog.coverImage}`,
        ],
      }),
    },
  };
}

async function getBlogBySlug(slug: string) {
  const blog = await prisma.blog.findFirst({
    where: {
      title: {
        mode: "insensitive",
        contains: slug.replace(/-/g, " "),
      },
      isPublished: true, // Only show published articles
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return blog;
}

export default async function BlogPost({ params }: Props) {
  return (
    <Suspense fallback={<BlogPostSkeleton />}>
      <BlogPostContent params={params} />
    </Suspense>
  );
}

async function BlogPostContent({ params }: Props) {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  // Process the content to preserve line breaks
  const processedContent = blog.content
    .replace(/\n(?!\n)/g, "<br>")
    .replace(/\n\n+/g, "</p><p>");

  const wrappedContent = processedContent.startsWith("<p>")
    ? processedContent
    : `<p>${processedContent}</p>`;

  const sanitizedContent = sanitizeHtml(wrappedContent, sanitizeOptions);

  return (
    <div className="min-h-screen bg-slate-50 py-8 w-full">
      <div className="mx-auto px-4 max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Blog List
        </Link>
      </div>
      <article className="mx-auto px-4 max-w-4xl bg-white rounded-lg shadow-sm">
        <div className="space-y-4 pt-8">
          <div className="flex flex-wrap gap-2">
            {blog.categories.map(({ category }) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-foreground">{blog.title}</h1>

          <div className="flex items-center gap-4 text-muted-foreground">
            {/* <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {blog.createdBy.firstName} {blog.createdBy.lastName}
              </span>
            </div> */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={blog.createdAt.toISOString()}>
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden bg-muted">
          {blog.coverImage ? (
            <Image
              src={`https://skybird-saas-boilerplate.s3.us-east-1.amazonaws.com/${blog.coverImage}`}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-24 w-24 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div
          className="prose prose-lg max-w-none dark:prose-invert pb-8
            [&_p]:mb-4 
            [&_br]:content-[''] 
            [&_br]:block 
            [&_br]:mt-4
            [&_ul]:list-disc 
            [&_ul]:pl-6 
            [&_ul]:mb-4
            [&_ol]:list-decimal 
            [&_ol]:pl-6 
            [&_ol]:mb-4
            [&_li]:mb-2
            [&_li]:pl-2
            prose-ul:mb-4
            prose-ol:mb-4
            prose-li:marker:text-gray-500
            dark:prose-li:marker:text-gray-400"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </article>
    </div>
  );
}
