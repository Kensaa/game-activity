export const colors = [
    '#a50026',
    '#d73027',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#ffffbf',
    '#d9ef8b',
    '#a6d96a',
    '#66bd63',
    '#1a9850',
    '#006837'
]

export const convertSecondsToString = (originalTime: number): string => {
    let minutes = Math.floor(originalTime / 60)
    const seconds = originalTime % 60
    const hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    return `${hours}h ${minutes.toString().padStart(2, '0')}min ${seconds
        .toString()
        .padStart(2, '0')}sec`
}
