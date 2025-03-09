import { useMemo, useState } from 'react'
import { colors, convertSecondsToString, useInterval } from '../utils'
import { invoke } from '@tauri-apps/api/core'
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
import { getCurrentWindow } from '@tauri-apps/api/window'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function TotalTime() {
    const [data, setData] = useState<Record<string, Record<string, number>>>({})

    useInterval(async () => {
        if (!(await getCurrentWindow().isVisible())) {
            return
        }
        invoke('get_all_data').then(res => {
            setData(res as Record<string, Record<string, number>>)
        })
    }, 1000)

    const barData = useMemo(() => {
        const apps: Record<string, number> = {}
        for (const day in data) {
            for (const app in data[day]) {
                if (!apps[app]) {
                    apps[app] = 0
                }
                apps[app] += data[day][app]
            }
        }

        const labels = Object.keys(apps).sort((a, b) => apps[b] - apps[a])
        const values = labels.map(label => apps[label])

        return {
            labels,
            datasets: [
                {
                    label: 'Time Spent',
                    data: values,
                    backgroundColor: colors
                }
            ]
        }
    }, [data])

    return (
        <div className='page'>
            <div className='graph'>
                <Bar
                    data={barData}
                    options={{
                        responsive: true,
                        scales: {
                            y: {
                                ticks: {
                                    callback: value =>
                                        convertSecondsToString(value as number)
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
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
