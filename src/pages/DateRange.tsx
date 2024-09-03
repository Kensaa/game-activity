import 'react-calendar/dist/Calendar.css'
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css'
import DateRangePicker from '@wojtekmaj/react-daterange-picker'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useMemo, useState } from 'react'
import {
    compareDates,
    convertSecondsToString,
    dateToString,
    get7DaysAgo,
    useInterval,
    colors
} from '../utils'
import { invoke } from '@tauri-apps/api/core'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

// find a way to deselect the current day
export default function DateRange() {
    const [dates, setDates] = useState<Value>([get7DaysAgo(), new Date()])
    const [data, setData] = useState<Record<string, Record<string, number>>>({})

    useInterval(() => {
        if (!dates || !Array.isArray(dates) || !dates[0] || !dates[1]) {
            setData({})
            return
        }
        let start = dateToString(dates[0] as Date)
        let end = dateToString(dates[1] as Date)
        invoke('get_daterange_data', {
            start,
            end
        }).then(res => {
            setData(res as Record<string, Record<string, number>>)
        })
    }, 1000)

    const barData = useMemo(() => {
        const dates = Object.keys(data)
        dates.sort(compareDates)
        console.log(dates)

        const apps: string[] = []
        for (const date of dates) {
            for (const app in data[date]) {
                if (!apps.includes(app)) {
                    apps.push(app)
                }
            }
        }

        return {
            labels: dates,
            // each dataset represents a different app, the data array is the time spent on that app for each day
            datasets: apps.map((app, appIndex) => {
                const appData = []
                for (const date of dates) {
                    appData.push(data[date][app] || 0)
                }
                return {
                    label: app,
                    data: appData,
                    backgroundColor: colors[appIndex % colors.length]
                }
            })
        }
    }, [data])

    return (
        <div className='page'>
            <DateRangePicker
                onChange={setDates}
                value={dates}
                autoFocus={false}
            />
            <div className='graph'>
                <Bar
                    data={barData}
                    options={{
                        responsive: true,
                        scales: {
                            x: { stacked: true },
                            y: {
                                stacked: true,
                                ticks: {
                                    callback: value => {
                                        return convertSecondsToString(
                                            value as number
                                        )
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    title: item => {
                                        return item[0].dataset.label
                                    },
                                    label: item => {
                                        return convertSecondsToString(
                                            item.raw as number
                                        )
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    )
}
