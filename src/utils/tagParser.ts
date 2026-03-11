export const PREDEFINED_TAGS = [
    { label: "Education", color: "bg-blue-500" },
    { label: "Work", color: "bg-orange-500" },
    { label: "Vacation", color: "bg-emerald-500" },
    { label: "Dining", color: "bg-rose-500" },
    { label: "Coffee", color: "bg-amber-500" },
];

export const CUSTOM_COLORS = [
    "bg-red-500", "bg-pink-500", "bg-purple-500", "bg-indigo-500",
    "bg-cyan-500", "bg-teal-500", "bg-lime-500", "bg-yellow-500"
];

export function parseTag(tagStr: string | null | undefined): { label: string, color: string } | null {
    if (!tagStr) return null;
    if (tagStr.includes('|')) {
        const [label, color] = tagStr.split('|');
        return { label, color: color || "bg-gray-500" };
    }
    const predefined = PREDEFINED_TAGS.find(t => t.label === tagStr);
    if (predefined) return predefined;
    return { label: tagStr, color: "bg-gray-500" };
}
