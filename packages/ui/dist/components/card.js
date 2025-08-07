"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const jsx_runtime_1 = require("react/jsx-runtime");
function Card({ title, children, href, }) {
    return ((0, jsx_runtime_1.jsxs)("a", { className: "group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30", href: `${href}?utm_source=create-turbo&utm_medium=with-tailwind&utm_campaign=create-turbo"`, rel: "noopener noreferrer", target: "_blank", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "mb-3 text-2xl font-semibold", children: [title, " ", (0, jsx_runtime_1.jsx)("span", { className: "inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none", children: "->" })] }), (0, jsx_runtime_1.jsx)("p", { className: "m-0 max-w-[30ch] text-sm opacity-50", children: children })] }));
}
