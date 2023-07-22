import { useMemo } from 'react'
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
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
import { colors, convertSecondsToString } from '../utils'
import { Spinner } from 'react-bootstrap'

export interface BarComponentProps {
    data: Record<string, Record<string, number>>
    dayCount?: number
}

export default function BarComponent({
    data,
    dayCount = 7
}: BarComponentProps) {
    if (data === undefined) {
        return (
            <div className='h-100 d-flex justify-content-center align-items-center'>
                <Spinner animation='border' />
            </div>
        )
    }

    const barData = useMemo(() => {
        let selectedDays: Record<string, Record<string, number>> = {}
        let i = 0
        for (const day of Object.keys(data).reverse()) {
            if (i >= dayCount) break
            selectedDays[day] = data[day]
            i++
        }

        console.log(selectedDays)
        const differentsGames: string[] = []

        for (const day of Object.values(selectedDays)) {
            for (const name of Object.keys(day)) {
                if (!differentsGames.includes(name)) {
                    differentsGames.push(name)
                }
            }
        }
        return {
            labels: Object.keys(selectedDays),
            datasets: differentsGames.map((game, i) => {
                const datasetData: number[] = []
                for (const day of Object.values(selectedDays)) {
                    if (Object.keys(day).includes(game)) {
                        datasetData.push(day[game])
                    } else {
                        datasetData.push(0)
                    }
                }
                return {
                    label: game,
                    data: datasetData,
                    backgroundColor: [colors[i % colors.length]]
                }
            })
        }
    }, [data])

    return (
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
                                return convertSecondsToString(value as number)
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
    )
}
