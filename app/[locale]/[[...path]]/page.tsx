import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  defaultLocale,
  indexablePublicPagePaths,
  isPublicPagePath,
  localeFromSlug,
  localeOpenGraph,
  localePath,
  publicPagePaths,
  supportedLocales,
  type AppLocale,
  type PublicPagePath,
} from "@/lib/i18n/config";
import {
  getPublicContent,
  providerGuideSlugs,
  type ProviderGuideSlug,
  type UseCaseSlug,
  useCaseSlugs,
} from "@/lib/i18n/public-content";
import {
  LocalizedGuideIndex,
  LocalizedLanding,
  LocalizedLegalPage,
  LocalizedProviderGuide,
  LocalizedUseCase,
} from "../../localized-public";

type PageParams = Readonly<{ locale: string; path?: string[] }>;

function pagePath(parts: readonly string[] | undefined): string {
  return parts?.length ? `/${parts.join("/")}` : "/";
}

function metadataCopy(locale: AppLocale, path: PublicPagePath): Readonly<{ title: string; description: string; noIndex?: boolean }> {
  const content = getPublicContent(locale);
  if (path === "/") return { title: content.landing.metaTitle, description: content.landing.metaDescription };
  if (path === "/ai-guides") return { title: content.guideIndex.metaTitle, description: content.guideIndex.metaDescription };
  if (path === "/privacy") return { title: content.legal.privacy.metaTitle, description: content.legal.privacy.metaDescription };
  if (path === "/terms") return { title: content.legal.terms.metaTitle, description: content.legal.terms.metaDescription };
  if (path === "/data-deletion") return { title: content.legal.deletion.metaTitle, description: content.legal.deletion.metaDescription };
  const useCase = path.match(/^\/use-cases\/(.+)$/)?.[1] as UseCaseSlug | undefined;
  if (useCase && useCaseSlugs.includes(useCase)) return { title: content.useCases[useCase].metaTitle, description: content.useCases[useCase].metaDescription };
  const guide = path.slice(1) as ProviderGuideSlug;
  if (providerGuideSlugs.includes(guide)) return { title: content.providerGuides[guide].metaTitle, description: content.providerGuides[guide].metaDescription, noIndex: content.providerGuides[guide].noIndex };
  return { title: content.seo.defaultTitle, description: content.seo.defaultDescription, noIndex: true };
}

export function generateStaticParams(): PageParams[] {
  return supportedLocales.flatMap((locale) => publicPagePaths.map((path) => ({
    locale: localePath(locale).slice(1),
    path: path === "/" ? undefined : path.slice(1).split("/"),
  })));
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const input = await params;
  const locale = localeFromSlug(input.locale);
  const path = pagePath(input.path);
  if (!locale || !isPublicPagePath(path)) return { robots: { index: false, follow: false } };
  const copy = metadataCopy(locale, path);
  const canonical = localePath(locale, path);
  const languages = Object.fromEntries(supportedLocales.map((item) => [item, localePath(item, path)]));
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical, languages: { ...languages, "x-default": localePath(defaultLocale, path) } },
    robots: copy.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title: copy.title, description: copy.description, url: canonical, siteName: "TRAPEAK", type: "website", locale: localeOpenGraph[locale], alternateLocale: supportedLocales.filter((item) => item !== locale).map((item) => localeOpenGraph[item]) },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description },
  };
}

export default async function LocalizedPublicPage({ params }: { params: Promise<PageParams> }) {
  const input = await params;
  const locale = localeFromSlug(input.locale);
  const path = pagePath(input.path);
  if (!locale || !isPublicPagePath(path)) notFound();
  const content = getPublicContent(locale);
  if (path === "/") return <LocalizedLanding locale={locale} />;
  if (path === "/ai-guides") return <LocalizedGuideIndex locale={locale} />;
  if (path === "/privacy") return <LocalizedLegalPage locale={locale} path={path} content={content.legal.privacy} />;
  if (path === "/terms") return <LocalizedLegalPage locale={locale} path={path} content={content.legal.terms} />;
  if (path === "/data-deletion") return <LocalizedLegalPage locale={locale} path={path} content={content.legal.deletion} />;
  const useCase = path.match(/^\/use-cases\/(.+)$/)?.[1] as UseCaseSlug | undefined;
  if (useCase && useCaseSlugs.includes(useCase)) return <LocalizedUseCase locale={locale} slug={useCase} />;
  const guide = path.slice(1) as ProviderGuideSlug;
  if (providerGuideSlugs.includes(guide)) return <LocalizedProviderGuide locale={locale} slug={guide} />;
  notFound();
}

export const dynamicParams = false;

void indexablePublicPagePaths;
