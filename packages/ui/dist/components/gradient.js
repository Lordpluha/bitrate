"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gradient = Gradient;
const jsx_runtime_1 = require("react/jsx-runtime");
function Gradient({ conic, className, small, }) {
    return ((0, jsx_runtime_1.jsx)("span", { className: `absolute mix-blend-normal will-change-[filter] rounded-[100%] ${small ? "blur-[32px]" : "blur-[75px]"} ${conic
            ? "bg-[conic-gradient(from_180deg_at_50%_50%,var(--red-1000)_0deg,_var(--purple-1000)_180deg,_var(--blue-1000)_360deg)]"
            : ""} ${className ?? ""}` }));
}
