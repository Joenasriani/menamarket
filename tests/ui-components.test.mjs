import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, EmptyState } from "../packages/ui/dist/index.js";

test("Button renders label", () => {
  const html = renderToStaticMarkup(React.createElement(Button, { href: "/markets" }, "Browse structure"));
  assert.match(html, /Browse structure/);
  assert.match(html, /href="\/markets"/);
});

test("EmptyState renders title and description", () => {
  const html = renderToStaticMarkup(React.createElement(EmptyState, { title: "No live markets yet", description: "Market listings will appear later." }));
  assert.match(html, /No live markets yet/);
  assert.match(html, /Market listings will appear later/);
});
