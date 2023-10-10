import { useMemo } from 'react'
import dataStore from '../stores/data'
import { Spinner } from 'react-bootstrap'
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

export default function TotalTime() {
    const data = dataStore()

    if (Object.keys(data).length === 0) {
        return (
            <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
                Waiting for data...
                <Spinner animation='border' />
            </div>
        )
    }

    const barData = useMemo(() => {
        const games: Record<string, number> = {}
        for (const day of Object.values(data)) {
            for (const game of Object.keys(day)) {
                if (games[game] === undefined) {
                    games[game] = 0
                }
                games[game] += day[game]
            }
        }
        console.log(games)
        const labels = Object.keys(games).sort((a, b) => games[b] - games[a])
        const values = labels.map(label => games[label])

        return {
            labels,
            datasets: [
                {
                    label: 'Time played',
                    data: values,
                    backgroundColor: colors
                }
            ]
        }
    }, [data])

    return (
        <div className='page'>
            <div className='content'>
                <div
                    style={{ width: '80%', height: '80%' }}
                    className='d-flex flex-column align-items-center'
                >
                    <Bar
                        data={barData}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    ticks: {
                                        callback: value =>
                                            convertSecondsToString(
                                                value as number
                                            )
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
        </div>
    )
}
