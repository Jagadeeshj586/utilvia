"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.formatBytes = formatBytes;
exports.formatINR = formatINR;
exports.formatCompactINR = formatCompactINR;
exports.formatUSD = formatUSD;
exports.formatNum = formatNum;
exports.uint8ToBlob = uint8ToBlob;
exports.downloadBlob = downloadBlob;
exports.downloadText = downloadText;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0)
        return "0 B";
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function formatINR(value, digits = 0) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: digits,
    }).format(value);
}
function formatCompactINR(value) {
    if (!Number.isFinite(value))
        return "—";
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);
    const trim = (n) => n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
    if (abs >= 10000000)
        return `${sign}₹${trim(abs / 10000000)}Cr`;
    if (abs >= 100000)
        return `${sign}₹${trim(abs / 100000)}L`;
    return formatINR(value);
}
function formatUSD(value, digits = 0) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: digits,
    }).format(value);
}
function formatNum(value, digits = 2) {
    if (!Number.isFinite(value))
        return "—";
    return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}
function uint8ToBlob(bytes, type) {
    const copy = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(copy).set(bytes);
    return new Blob([copy], { type });
}
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
function downloadText(text, filename, type = "text/plain") {
    downloadBlob(new Blob([text], { type }), filename);
}
