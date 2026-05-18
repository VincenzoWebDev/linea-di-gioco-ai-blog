import { jsx } from "react/jsx-runtime";
import React from "react";
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
const Card = React.forwardRef(function Card2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className),
      ...props
    }
  );
});
const CardHeader = React.forwardRef(function CardHeader2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props });
});
const CardTitle = React.forwardRef(function CardTitle2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsx(
    "h3",
    {
      ref,
      className: cn("text-lg font-semibold leading-none tracking-tight text-slate-900", className),
      ...props
    }
  );
});
const CardDescription = React.forwardRef(function CardDescription2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsx("p", { ref, className: cn("text-sm text-slate-500", className), ...props });
});
const CardContent = React.forwardRef(function CardContent2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props });
});
React.forwardRef(function CardFooter2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props });
});
export {
  Card as C,
  CardContent as a,
  CardDescription as b,
  CardHeader as c,
  CardTitle as d
};
