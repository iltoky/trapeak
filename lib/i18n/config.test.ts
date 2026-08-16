import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultLocale,
  localeFromSlug,
  localePath,
  resolveAcceptLanguage,
  supportedLocales,
} from "./config.ts";
import { getPublicContent } from "./public-content.ts";
import { getUiMessages } from "./ui.ts";

test("supports the seven launch locales", () => {
  assert.deepEqual(supportedLocales, ["en", "pt-BR", "es-419", "id", "vi", "hi", "bn"]);
});

test("maps public locale slugs in both directions", () => {
  const expected = ["/en", "/pt-br", "/es", "/id", "/vi", "/hi", "/bn"];
  assert.deepEqual(supportedLocales.map((locale) => localePath(locale)), expected);
  assert.deepEqual(expected.map((path) => localeFromSlug(path.slice(1))), supportedLocales);
});

test("detects the highest-quality supported browser locale", () => {
  assert.equal(resolveAcceptLanguage("de-DE,pt-BR;q=0.9,en;q=0.8"), "pt-BR");
  assert.equal(resolveAcceptLanguage("es-MX,es;q=0.8"), "es-419");
  assert.equal(resolveAcceptLanguage("bn-BD,hi;q=0.5"), "bn");
});

test("falls back to English for an unsupported browser locale", () => {
  assert.equal(resolveAcceptLanguage("pl-PL,de;q=0.8"), defaultLocale);
});

test("provides complete public and authenticated dictionaries", () => {
  for (const locale of supportedLocales) {
    const publicCopy = getPublicContent(locale);
    const ui = getUiMessages(locale);
    assert.ok(publicCopy.landing.hero.every((line) => line.trim().length > 0));
    assert.equal(Object.keys(publicCopy.useCases).length, 5);
    assert.equal(Object.keys(publicCopy.providerGuides).length, 7);
    assert.equal(publicCopy.legal.privacy.sections.length, 5);
    assert.ok(ui.dashboard.title.length > 0);
    assert.ok(ui.access.healthWarning.length > 0);
  }
});

test("uses localized positioning rather than an English marketing fallback", () => {
  const titles = supportedLocales.map((locale) => getPublicContent(locale).landing.metaTitle);
  assert.equal(new Set(titles).size, supportedLocales.length);
});
