export const colors = [
    '#e41a1c',
    '#377eb8',
    '#4daf4a',
    '#984ea3',
    '#ff7f00',
    '#ffff33',
    '#a65628',
    '#f781bf',
    '#999999'
] /*[
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
]*/

export const convertSecondsToString = (originalTime: number): string => {
    let minutes = Math.floor(originalTime / 60)
    const seconds = originalTime % 60
    const hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    return `${hours}h ${minutes.toString().padStart(2, '0')}min ${seconds
        .toString()
        .padStart(2, '0')}sec`
}

export const sortDays = (days: string[]): string[] => {
    return [...days].sort((a, b) => {
        let [day1, month1, year1] = a.split('/')
        let [day2, month2, year2] = b.split('/')
        if (year1 > year2) {
            return 1
        } else if (year2 > year1) {
            return -1
        } else {
            if (month1 > month2) {
                return 1
            } else if (month2 > month1) {
                return -1
            } else {
                if (day1 > day2) {
                    return 1
                } else if (day2 > day1) {
                    return -1
                } else {
                    return 0
                }
            }
        }
    })
}

const a = ['02/01/2020', '01/01/2020', '01/02/2020', '08/08/1999']
console.log(a)

console.log(sortDays(a))
