import { useEffect, useRef } from 'react'

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
]

export function useInterval(callback: () => void, delay: number) {
    // Creating a ref
    const savedCallback = useRef(callback)

    // To remember the latest callback .
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // combining the setInterval and
    //clearInterval methods based on delay.
    useEffect(() => {
        if (delay !== null) {
            let id = setInterval(() => {
                savedCallback.current()
            }, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

export function dateToString(date: Date) {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
}

export const convertSecondsToString = (originalTime: number): string => {
    let minutes = Math.floor(originalTime / 60)
    const seconds = originalTime % 60
    const hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    return `${hours}h ${minutes.toString().padStart(2, '0')}min ${seconds
        .toString()
        .padStart(2, '0')}sec`
}

export function get7DaysAgo() {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date
}

export const compareDates = (date1: string, date2: string): number => {
    const [day1, month1, year1] = date1.split('-')
    const [day2, month2, year2] = date2.split('-')
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
}
