export function buildGradient(colors) {
    // repeat the first color for a seamless loop
    const loopedColors = [...colors, colors[0]];
    return `linear-gradient(90deg, ${loopedColors.join(', ')})`;
}