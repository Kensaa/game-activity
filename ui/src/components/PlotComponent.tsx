import { useMemo } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { colors, convertSecondsToString, sortDays } from '../utils'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

export interface PlotComponentProps {
    data: Record<string, Record<string, number>>
    dayCount: number
}

export default function PlotComponent({
    data,
    dayCount = 7
}: PlotComponentProps) {
    const plotData = useMemo(() => {
        let selectedDays: Record<string, Record<string, number>> = {}
        let i = 0
        for (const day of sortDays(Object.keys(data).reverse())) {
            if (i >= dayCount) break
            selectedDays[day] = data[day]
            i++
        }
        const days = sortDays(Object.keys(selectedDays))
        const differentsGames: string[] = []

        for (const day of days.map(day => selectedDays[day])) {
            for (const name of Object.keys(day)) {
                if (!differentsGames.includes(name)) {
                    differentsGames.push(name)
                }
            }
        }
        return {
            labels: days,
            datasets: differentsGames.map((game, i) => {
                const datasetData: number[] = []
                for (const day of days.map(day => selectedDays[day])) {
                    if (Object.keys(day).includes(game)) {
                        datasetData.push(day[game])
                    } else {
                        datasetData.push(0)
                    }
                }
                const color = [colors[i % colors.length]]
                return {
                    label: game,
                    data: datasetData,
                    backgroundColor: color,
                    borderColor: color
                }
            })
        }
    }, [data])
    return (
        <Line
            data={plotData}
            options={{
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
