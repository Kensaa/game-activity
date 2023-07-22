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

export interface BarComponentProps {
    data: Record<string, Record<string, number>>
}
export default function BarComponent({ data }: BarComponentProps) {
    const differentsGames: string[] = []
    for (const day of Object.values(data)) {
        for (const name of Object.keys(day)) {
            if (!differentsGames.includes(name)) {
                differentsGames.push(name)
            }
        }
    }

    const barData = useMemo(() => {
        return {
            labels: Object.keys(data),
            datasets: differentsGames.map((game, i) => {
                const datasetData: number[] = []
                for (const day of Object.values(data)) {
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
